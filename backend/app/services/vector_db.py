"""
services/vector_db.py
---------------------
Per-user FAISS index management.

Each user gets two files under FAISS_INDEX_DIR:
  • user_{user_id}.bin   – the FAISS flat-L2 index
  • user_{user_id}.pkl   – a list mapping FAISS row position → Note.id

The module keeps a process-level cache of open VectorDBService instances so
disk is only read once per user per process lifetime; call
``VectorDBService.for_user(user_id)`` to obtain or reuse an instance.
"""

from __future__ import annotations

import logging
import os
import pickle
from threading import Lock
from typing import Dict, List

import faiss
import numpy as np

from backend.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Per-user index cache (keyed by user_id)
# ---------------------------------------------------------------------------
_cache: Dict[int, "VectorDBService"] = {}
_cache_lock: Lock = Lock()

# Default embedding dimension for all-MiniLM-L6-v2
_DIMENSION = 384


def _index_dir() -> str:
    settings = get_settings()
    # Resolve a stable directory next to the config-supplied path
    base = os.path.dirname(os.path.abspath(settings.FAISS_INDEX_PATH))
    path = os.path.join(base, "faiss_indexes")
    os.makedirs(path, exist_ok=True)
    return path


class VectorDBService:
    """
    FAISS IndexFlatL2 wrapper scoped to a single user.

    Do not instantiate directly — use :meth:`for_user` so the process cache
    is populated correctly.
    """

    def __init__(self, user_id: int, index_dir: str | None = None) -> None:
        self.user_id = user_id
        self.dimension = _DIMENSION

        root = index_dir or _index_dir()
        self._index_path = os.path.join(root, f"user_{user_id}.bin")
        self._mapping_path = os.path.join(root, f"user_{user_id}.pkl")

        self.index: faiss.IndexFlatL2 = faiss.IndexFlatL2(self.dimension)
        self.id_mapping: List[int] = []  # position → Note.id

        self._load()

    # ------------------------------------------------------------------
    # Class-level factory / cache
    # ------------------------------------------------------------------

    @classmethod
    def for_user(cls, user_id: int) -> "VectorDBService":
        """Return the cached (or freshly loaded) instance for *user_id*."""
        with _cache_lock:
            if user_id not in _cache:
                _cache[user_id] = cls(user_id)
            return _cache[user_id]

    @classmethod
    def evict(cls, user_id: int) -> None:
        """Remove *user_id* from the cache (needed after a full reindex)."""
        with _cache_lock:
            _cache.pop(user_id, None)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def add_note(self, note_id: int, embedding: List[float]) -> None:
        """Add a single embedding and persist immediately."""
        vector = np.array([embedding], dtype="float32")
        self.index.add(vector)
        self.id_mapping.append(note_id)
        self._save()
        logger.debug("user=%d  added note_id=%d  total=%d", self.user_id, note_id, self.index.ntotal)

    def add_notes(self, note_ids: List[int], embeddings: np.ndarray) -> None:
        """Bulk-add embeddings and persist once at the end."""
        vectors = embeddings.astype("float32")
        self.index.add(vectors)
        self.id_mapping.extend(note_ids)
        self._save()
        logger.info("user=%d  bulk-added %d notes  total=%d", self.user_id, len(note_ids), self.index.ntotal)

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[int]:
        """
        Return up to *top_k* Note IDs whose embeddings are nearest to
        *query_embedding* (L2 distance).  Returns [] when the index is empty.
        """
        if self.index.ntotal == 0:
            logger.info("user=%d  FAISS index is empty — no results", self.user_id)
            return []

        vector = np.array([query_embedding], dtype="float32")
        k = min(top_k, self.index.ntotal)
        distances, indices = self.index.search(vector, k)

        note_ids: List[int] = []
        for idx in indices[0]:
            if idx == -1:
                continue  # FAISS sentinel for "not enough results"
            note_ids.append(self.id_mapping[idx])

        logger.info("user=%d  FAISS search top-%d → note_ids=%s", self.user_id, top_k, note_ids)
        return note_ids

    def reset(self) -> None:
        """Clear the in-memory index and delete persisted files."""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.id_mapping = []
        for path in (self._index_path, self._mapping_path):
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
        logger.info("user=%d  index reset", self.user_id)

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------

    def _save(self) -> None:
        faiss.write_index(self.index, self._index_path)
        with open(self._mapping_path, "wb") as fh:
            pickle.dump(self.id_mapping, fh)

    def _load(self) -> None:
        if os.path.exists(self._index_path) and os.path.exists(self._mapping_path):
            self.index = faiss.read_index(self._index_path)
            with open(self._mapping_path, "rb") as fh:
                self.id_mapping = pickle.load(fh)
            logger.info(
                "user=%d  loaded FAISS index (%d vectors) from %s",
                self.user_id,
                self.index.ntotal,
                self._index_path,
            )
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.id_mapping = []
            logger.info("user=%d  fresh FAISS index (no persisted files found)", self.user_id)
