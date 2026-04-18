from .embedding import EmbeddingService
from .vector_db import VectorDBService
from typing import List

class RetrievalService:
    def __init__(self, embedding_service: EmbeddingService = None, vector_db_service: VectorDBService = None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_db_service = vector_db_service or VectorDBService()

    def add_note_to_index(self, note_id: int, content: str):
        """
        Converts note content to embedding and stores it in the FAISS index.
        """
        embedding = self.embedding_service.generate_embedding(content)
        self.vector_db_service.add_note(note_id, embedding)

    def find_similar_notes(self, query: str, top_k: int = 5) -> List[int]:
        """
        Converts query string to embedding and searches for top K similar notes.
        Returns a list of note IDs.
        """
        query_embedding = self.embedding_service.generate_embedding(query)
        return self.vector_db_service.search(query_embedding, top_k)
