import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import MagicMock
from jose import jwt
from datetime import datetime, timedelta

from app.main import app
from app.db.database import Base, get_async_db
from config import get_settings
from app.services.llm import LLMService

settings = get_settings()

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture()
async def db_session(db_engine):
    TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=db_engine, class_=AsyncSession)
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture()
def override_get_db(db_session):
    async def _override_get_db():
        yield db_session
    app.dependency_overrides[get_async_db] = _override_get_db
    yield
    app.dependency_overrides.clear()

@pytest_asyncio.fixture()
async def client(override_get_db, mock_llm_service):
    # Disable rate limits during testing to avoid 429
    if hasattr(app.state, "limiter"):
        app.state.limiter.enabled = False
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture()
def mock_llm_service():
    mock_service = MagicMock(spec=LLMService)
    mock_service.generate_response.return_value = "mocked response"
    app.state.llm = mock_service
    return mock_service

@pytest_asyncio.fixture()
async def test_user(db_session):
    from app.models.user import User
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("testpassword123")
    user = User(email="test@example.com", hashed_password=hashed_password)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture()
def auth_headers(test_user):
    to_encode = {"sub": str(test_user.id)}
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}
