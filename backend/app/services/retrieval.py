"""
services/retrieval.py
---------------------
Bridges EmbeddingService ↔ VectorDBService for a specific user.

Every public method now accepts *user_id* so the pipeline is scoped to the
correct per-user FAISS index.  The class itself is stateless; it obtains the
right VectorDBService instance from the process cache on each call.
"""

from __future__ import annotations

import logging
from typing import List

import numpy as np

from .embedding import EmbeddingService
from .vector_db import VectorDBService

logger = logging.getLogger(__name__)


class RetrievalService:
    """High-level service bridging embedding generation and FAISS storage."""

    def __init__(self, embedding_service: EmbeddingService | None = None) -> None:
        # EmbeddingService loads the model lazily via a process-level singleton,
        # so constructing it here is cheap after the first call.
        self.embedding_service: EmbeddingService = embedding_service or EmbeddingService()

    # ------------------------------------------------------------------
    # Index write
    # ------------------------------------------------------------------

    def add_note_to_index(self, user_id: int, note_id: int, content: str) -> None:
        """
        Embed *content* and store the vector in the per-user FAISS index.

        Raises on failure so callers can log a proper WARNING (not silently ignore).
        """
        embedding: List[float] = self.embedding_service.generate_embedding(content)
        vdb = VectorDBService.for_user(user_id)
        vdb.add_note(note_id, embedding)
        logger.info("user=%d  indexed note_id=%d", user_id, note_id)

    def rebuild_index(
        self,
        user_id: int,
        note_ids: List[int],
        contents: List[str],
    ) -> None:
        """
        Wipe the existing index for *user_id* and rebuild it from scratch.

        Used by the ``POST /notes/reindex`` endpoint.
        """
        if len(note_ids) != len(contents):
            raise ValueError("note_ids and contents must have the same length")

        # Reset persisted files and evict the stale cache entry
        vdb = VectorDBService.for_user(user_id)
        vdb.reset()
        VectorDBService.evict(user_id)

        if not note_ids:
            logger.info("user=%d  reindex complete (no notes to index)", user_id)
            return

        logger.info("user=%d  embedding %d notes for reindex …", user_id, len(note_ids))
        embeddings: np.ndarray = self.embedding_service.generate_embeddings(contents)

        # Obtain a fresh (post-eviction) instance and bulk-add
        fresh_vdb = VectorDBService.for_user(user_id)
        fresh_vdb.add_notes(note_ids, embeddings)
        logger.info("user=%d  reindex complete (%d vectors)", user_id, fresh_vdb.index.ntotal)

    # ------------------------------------------------------------------
    # Index read
    # ------------------------------------------------------------------

    def find_similar_notes(
        self,
        user_id: int,
        query: str,
        top_k: int = 5,
    ) -> List[int]:
        """
        Embed *query* and return up to *top_k* Note IDs from the user's FAISS
        index ordered by L2 similarity.  Returns [] when the index is empty.
        """
        query_embedding: List[float] = self.embedding_service.generate_embedding(query)
        vdb = VectorDBService.for_user(user_id)
        return vdb.search(query_embedding, top_k)
