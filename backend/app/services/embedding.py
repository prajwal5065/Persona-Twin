from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a vector embedding for the given text.
        """
        embedding = self.model.encode(text)
        return embedding.tolist()

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generates embeddings for a list of texts.
        Returns a numpy array of shape (len(texts), embedding_dimension).
        """
        return self.model.encode(texts)
