import pytest
import httpx
from fastapi.testclient import TestClient
from app import app


@pytest.fixture(scope='session')
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
async def async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url='http://testserver') as c:
        yield c
