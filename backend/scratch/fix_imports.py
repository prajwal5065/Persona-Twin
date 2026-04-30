import os
import re

files = [
    r"backend/tests/test_vector_services.py",
    r"backend/tests/conftest.py",
    r"backend/app/tasks/weekly_digest.py",
    r"backend/app/services/voice.py",
    r"backend/app/services/vector_db.py",
    r"backend/app/services/rag.py",
    r"backend/app/services/personality.py",
    r"backend/app/services/llm.py",
    r"backend/app/services/embedding.py",
    r"backend/app/services/insights.py",
    r"backend/app/services/digest.py",
    r"backend/app/services/decision.py",
    r"backend/app/routes/user.py",
    r"backend/app/routes/simulation.py",
    r"backend/app/routes/profile.py",
    r"backend/app/routes/note.py",
    r"backend/app/routes/insights.py",
    r"backend/app/routes/digest.py",
    r"backend/app/routes/chat.py",
    r"backend/app/rate_limit.py",
    r"backend/app/routes/auth.py",
    r"backend/app/models/note.py",
    r"backend/app/models/user.py",
    r"backend/app/middleware/logging.py",
    r"backend/app/models/digest.py",
    r"backend/app/main.py",
    r"backend/app/db/database.py",
    r"backend/app/dependencies/auth.py",
    r"backend/alembic/env.py",
]

# Add any other files that might have it
base_path = r"c:/Users/admin/Desktop/MY_PROJECTS/prsonatwin/Persona-Twin"

def fix_imports(file_path):
    abs_path = os.path.join(base_path, file_path)
    if not os.path.exists(abs_path):
        print(f"File not found: {abs_path}")
        return

    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace backend.app with app
    new_content = content.replace("backend.app", "app")
    # Replace backend.config with config
    new_content = new_content.replace("backend.config", "config")
    
    if content != new_content:
        with open(abs_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes for {file_path}")

for f in files:
    fix_imports(f)
