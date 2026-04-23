from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from jose import jwt
from backend.config import get_settings

def get_user_id_for_limiter(request: Request) -> str:
    # Try to get from Authorization header
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        try:
            settings = get_settings()
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            sub = payload.get("sub")
            if sub:
                return str(sub)
        except Exception:
            pass
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_for_limiter)
