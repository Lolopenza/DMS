import os

import pytest
import httpx
from fastapi.testclient import TestClient
from app import app


def _internal_api_headers() -> dict:
    key = os.environ.get('DMC_INTERNAL_API_KEY', '')
    if key and key != 'change-me':
        return {'X-Internal-Api-Key': key}
    return {}


@pytest.fixture(scope='session')
def client():
    headers = _internal_api_headers()
    with TestClient(app, headers=headers) as c:
        yield c


@pytest.fixture
async def async_client():
    headers = _internal_api_headers()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url='http://testserver', headers=headers) as c:
        yield c
