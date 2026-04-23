import time
import uuid
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from backend.config import get_settings
from jose import jwt

logger = structlog.get_logger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        
        user_id = None
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ")[1]
            try:
                settings = get_settings()
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                sub = payload.get("sub")
                if sub:
                    user_id = str(sub)
            except Exception:
                pass

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        if user_id:
            structlog.contextvars.bind_contextvars(user_id=user_id)
            
        start_time = time.time()
        
        try:
            response = await call_next(request)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            logger.info(
                "request_completed",
                endpoint=request.url.path,
                user_id=user_id,
                duration_ms=duration_ms,
                status_code=response.status_code
            )
            
            return response
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                "request_failed",
                endpoint=request.url.path,
                user_id=user_id,
                duration_ms=duration_ms,
                status_code=500,
                error=str(e)
            )
            raise e
