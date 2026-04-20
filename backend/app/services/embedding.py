"""
services/embedding.py
---------------------
Wraps sentence-transformers so the model name is normalised before loading.

sentence-transformers accepts bare names like "all-MiniLM-L6-v2" directly, but
the config stores the fully-qualified name "sentence-transformers/all-MiniLM-L6-v2".
Passing the fully-qualified name to SentenceTransformer() causes a Hugging Face Hub
look-up that may fail in air-gapped environments. We strip the prefix so the locally
cached model is always found first.
"""

from __future__ import annotations

import logging
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer

from backend.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Singleton – one model instance per process (thread-safe after first load)
# ---------------------------------------------------------------------------
_model_instance: SentenceTransformer | None = None


def _get_model(model_name: str) -> SentenceTransformer:
    global _model_instance
    if _model_instance is None:
        # Strip the "sentence-transformers/" namespace prefix if present so that
        # the local cache is resolved correctly.
        bare_name = model_name.removeprefix("sentence-transformers/")
        logger.info("Loading SentenceTransformer model: %s", bare_name)
        _model_instance = SentenceTransformer(bare_name)
        logger.info("SentenceTransformer model loaded OK.")
    return _model_instance


class EmbeddingService:
    """Generates dense vector embeddings using sentence-transformers."""

    DIMENSION: int = 384  # all-MiniLM-L6-v2 output dimension

    def __init__(self, model_name: str | None = None) -> None:
        settings = get_settings()
        self._model_name = model_name or settings.EMBEDDING_MODEL
        # Eagerly load here so import-time failures surface immediately
        # instead of being silently swallowed by the route handler.
        self.model: SentenceTransformer = _get_model(self._model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """Return a float list embedding for *text*."""
        embedding: np.ndarray = self.model.encode(text, show_progress_bar=False)
        return embedding.tolist()

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Return an (N, D) float32 ndarray for a list of texts."""
        return self.model.encode(texts, show_progress_bar=False)
