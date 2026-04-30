import os
import sys
import shutil
from unittest.mock import patch

# Ensure project root is in sys.path
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if root not in sys.path:
    sys.path.insert(0, root)

from app.services.embedding import EmbeddingService
from app.services.vector_db import VectorDBService
from app.services.retrieval import RetrievalService

def test_integration():
    """
    Smoke test for the RAG infrastructure:
    1. Embedding generation
    2. FAISS storage and ID mapping (per-user)
    3. Retrieval logic
    4. Disk persistence
    """
    user_id = 9999  # Test user ID
    data_dir = "test_data_tmp"
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    os.makedirs(data_dir)
    
    print("\n--- Starting Integration Test ---\n")
    
    print("[1/5] Initializing services...")
    embedding_service = EmbeddingService()
    
    # Pre-populate the cache with a VectorDBService pointing to our temp dir
    test_vdb = VectorDBService(user_id=user_id, index_dir=data_dir)
    with patch("app.services.vector_db._cache", {user_id: test_vdb}):
        retrieval_service = RetrievalService(embedding_service=embedding_service)
        
        # 1. Test Embedding Generation
        print("[2/5] Testing embedding generation...")
        text = "Artificial Intelligence is transforming the world."
        vector = embedding_service.generate_embedding(text)
        assert isinstance(vector, list)
        assert len(vector) == 384
        print("      ✓ Vector size: 384 (Match)")
        
        # 2. Test Storing and Mapping
        print("[3/5] Testing FAISS storage and Note ID mapping...")
        notes = [
            (1, "The quick brown fox jumps over the lazy dog"),
            (2, "Python is a versatile programming language"),
            (3, "FAISS is a library for efficient similarity search"),
            (4, "Deep learning models require lots of data"),
            (5, "Natural language processing is a subset of AI")
        ]
        
        for note_id, content in notes:
            retrieval_service.add_note_to_index(user_id=user_id, note_id=note_id, content=content)
        
        assert len(test_vdb.id_mapping) == 5
        print("      ✓ 5 notes indexed correctly for user 9999.")
        
        # 3. Test Retrieval
        print("[4/5] Testing retrieval system (Query similarity)...")
        query = "Tell me about machine learning"
        results = retrieval_service.find_similar_notes(user_id=user_id, query=query, top_k=2)
        
        print(f"      - Query: '{query}'")
        print(f"      - Top results (Node IDs): {results}")
        assert len(results) <= 2
        print("      ✓ Retrieval successful.")
        
        # 4. Test Save/Load
        print("[5/5] Testing disk persistence (Save/Load)...")
        # Re-initialize service and check if it loads the same mapping from the temp dir
        new_vector_db = VectorDBService(user_id=user_id, index_dir=data_dir)
        assert len(new_vector_db.id_mapping) == 5
        assert new_vector_db.index.ntotal == 5
        print("      ✓ Mapping loaded correctly from disk.")
    
    # Cleanup
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    print("\n--- ✅ All Tests Passed! ---\n")

if __name__ == "__main__":
    try:
        test_integration()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
