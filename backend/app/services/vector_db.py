import faiss
import numpy as np
import os
import pickle
from typing import List, Dict, Tuple
from backend.config import get_settings

settings = get_settings()

class VectorDBService:
    def __init__(self, dimension: int = 384, index_path: str = None, mapping_path: str = None):
        self.dimension = dimension
        self.index_path = index_path or settings.FAISS_INDEX_PATH
        self.mapping_path = mapping_path or settings.ID_MAPPING_PATH
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        os.makedirs(os.path.dirname(self.mapping_path), exist_ok=True)

        self.index = faiss.IndexFlatL2(dimension)
        self.id_mapping: List[int] = [] # Maps FAISS index to original Note ID

        self.load_index()

    def add_note(self, note_id: int, embedding: List[float]):
        """
        Adds a single note embedding to the index.
        """
        vector = np.array([embedding]).astype('float32')
        self.index.add(vector)
        self.id_mapping.append(note_id)
        self.save_index()

    def add_notes(self, note_ids: List[int], embeddings: np.ndarray):
        """
        Adds multiple note embeddings to the index.
        """
        vectors = embeddings.astype('float32')
        self.index.add(vectors)
        self.id_mapping.extend(note_ids)
        self.save_index()

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[int]:
        """
        Searches the index for the most similar embeddings and returns the original Note IDs.
        """
        if self.index.ntotal == 0:
            return []

        vector = np.array([query_embedding]).astype('float32')
        distances, indices = self.index.search(vector, min(top_k, self.index.ntotal))
        
        # indices[0] contains the indices of the neighbors in the FAISS index
        result_note_ids = [self.id_mapping[idx] for idx in indices[0] if idx != -1]
        return result_note_ids

    def save_index(self):
        """
        Saves the FAISS index and ID mapping to disk.
        """
        faiss.write_index(self.index, self.index_path)
        with open(self.mapping_path, 'wb') as f:
            pickle.dump(self.id_mapping, f)

    def load_index(self):
        """
        Loads the FAISS index and ID mapping from disk if they exist.
        """
        if os.path.exists(self.index_path) and os.path.exists(self.mapping_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.mapping_path, 'rb') as f:
                self.id_mapping = pickle.load(f)
        else:
            # Re-initialize if files don't exist
            self.index = faiss.IndexFlatL2(self.dimension)
            self.id_mapping = []
