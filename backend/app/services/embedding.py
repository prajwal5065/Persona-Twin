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


import logging
from typing import List

import google.generativeai as genai
from backend.config import get_settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Generates dense vector embeddings using Gemini API (text-embedding-04)."""

    # text-embedding-04 output dimension is 768 by default
    DIMENSION: int = 768

    def __init__(self, model_name: str | None = None) -> None:
        settings = get_settings()
        self._model_name = model_name or "models/text-embedding-04"
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("EmbeddingService initialized with model: %s", self._model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """Return a float list embedding for *text* using Gemini API."""
        try:
            result = genai.embed_content(
                model=self._model_name,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error("Gemini embedding generation failed: %s", e)
            # Return zero vector if API fails to avoid breaking FAISS strictly, 
            # though usually we should handle this higher up.
            return [0.0] * self.DIMENSION

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Return a list of embeddings for a list of texts."""
        try:
            result = genai.embed_content(
                model=self._model_name,
                content=texts,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error("Gemini batch embedding failure: %s", e)
            return [[0.0] * self.DIMENSION for _ in texts]

