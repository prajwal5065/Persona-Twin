
import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine
from backend.config import get_settings

async def test_conn():
    settings = get_settings()
    _raw_url = settings.DATABASE_URL
    _async_url = re.sub(r"^postgresql(\+\w+)?://", "postgresql+asyncpg://", _raw_url)
    _async_url = re.sub(r"\?sslmode=[^&]+", "", _async_url)
    _async_url = re.sub(r"&sslmode=[^&]+", "", _async_url)
    
    _connect_args = {}
    if "neon.tech" in _async_url or "sslmode=require" in _raw_url:
        _connect_args["ssl"] = True
    
    print(f"Testing URL: {_async_url}")
    print(f"Connect args: {_connect_args}")
    
    engine = create_async_engine(_async_url, connect_args=_connect_args)
    try:
        async with engine.connect() as conn:
            print("Successfully connected!")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
