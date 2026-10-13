import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine

@pytest.fixture(autouse=True)
async def cleanup_pool():
    yield
    # Dispose connection pool so connections don't leak across event loops
    await engine.dispose()

@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
