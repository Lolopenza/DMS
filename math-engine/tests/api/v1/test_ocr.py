import io

import pytest
from PIL import Image

import api.v1.ocr as ocr_api


def _png_bytes() -> bytes:
    image = Image.new('RGB', (2, 2), color=(255, 255, 255))
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return buffer.getvalue()


@pytest.mark.anyio
async def test_given_valid_image_when_ocr_endpoint_called_then_returns_text(async_client, monkeypatch):
    class _Reader:
        def readtext(self, *_args, **_kwargs):
            return ['line 1', 'line 2']

    monkeypatch.setattr(ocr_api, '_get_reader', lambda: _Reader())

    response = await async_client.post(
        '/api/v1/ocr/image_to_text',
        files={'image': ('sample.png', _png_bytes(), 'image/png')},
    )
    assert response.status_code == 200
    assert response.json()['text'] == 'line 1\nline 2'


@pytest.mark.anyio
async def test_given_ocr_failure_when_ocr_endpoint_called_then_returns_500(async_client, monkeypatch):
    class _BrokenReader:
        def readtext(self, *_args, **_kwargs):
            raise RuntimeError('ocr failed')

    monkeypatch.setattr(ocr_api, '_get_reader', lambda: _BrokenReader())

    response = await async_client.post(
        '/api/v1/ocr/image_to_text',
        files={'image': ('sample.png', _png_bytes(), 'image/png')},
    )
    assert response.status_code == 500
    payload = response.json()
    assert payload['error']['code'] == 'HTTP_ERROR'
