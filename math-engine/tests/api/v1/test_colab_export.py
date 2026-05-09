import ast
import os
from datetime import datetime

import api.v1.colab_export as colab_export
import nbformat
import pytest


def test_given_valid_request_when_building_colab_starter_then_notebook_structure_is_valid(client):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}
    response = client.post('/api/v1/colab/starter', json={'userId': 1, 'windowDays': 30}, headers=headers)
    # Arrange+Act completed above; assert response shape and deterministic notebook structure.
    assert response.status_code == 200
    data = response.json()
    assert data.get('filename', '').endswith('.ipynb')
    parsed = nbformat.reads(data.get('notebook', ''), as_version=4)
    assert parsed.nbformat == 4
    assert len(parsed.cells) >= 10
    markdown_cells = [cell for cell in parsed.cells if cell.cell_type == 'markdown']
    assert any('Lesson mode (AI Tutor)' in cell.source for cell in markdown_cells)
    assert any('Reflection task' in cell.source for cell in markdown_cells)
    assert any('does not embed access tokens or internal API keys' in cell.source for cell in markdown_cells)

    for cell in parsed.cells:
        if cell.cell_type != 'code':
            continue
        try:
            ast.parse(cell.source)
        except SyntaxError as exc:
            pytest.fail(f'Notebook code cell has syntax error: {exc}\n---\n{cell.source[:800]}')


def test_given_lesson_mode_disabled_when_building_colab_starter_then_disabled_message_is_rendered(client):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}
    response = client.post(
        '/api/v1/colab/starter',
        json={'userId': 1, 'windowDays': 30, 'lessonMode': False},
        headers=headers,
    )
    assert response.status_code == 200
    notebook = response.json().get('notebook', '')
    assert 'Lesson mode disabled for this notebook.' in notebook


def test_given_llm_unavailable_when_lesson_mode_enabled_then_fallback_lesson_text_is_used(client, monkeypatch):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}

    monkeypatch.setattr(colab_export, '_load_student_summary', lambda *_args, **_kwargs: ({}, {'attempts': []}))

    class _BrokenChatbot:
        def chat(self, *args, **kwargs):
            raise RuntimeError('llm down')

    monkeypatch.setattr(colab_export, 'get_chatbot_service', lambda: _BrokenChatbot())

    response = client.post(
        '/api/v1/colab/starter',
        json={'userId': 2, 'windowDays': 7, 'lessonMode': True},
        headers=headers,
    )
    assert response.status_code == 200
    notebook = response.json().get('notebook', '')
    assert '"nbformat"' in notebook
    assert '## Data pitfalls' in notebook
    assert 'Not enough data for stable logistic regression' in notebook


@pytest.mark.anyio
async def test_given_invalid_request_when_building_colab_starter_async_then_returns_422(async_client):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}

    response = await async_client.post(
        '/api/v1/colab/starter',
        json={'userId': 0, 'windowDays': 366},
        headers=headers,
    )

    assert response.status_code == 422
    payload = response.json()
    assert 'error' in payload
    assert payload['error']['code'] == 'VALIDATION_ERROR'


@pytest.mark.anyio
async def test_given_valid_request_when_building_colab_starter_async_then_generated_at_is_iso8601(async_client):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}

    response = await async_client.post(
        '/api/v1/colab/starter',
        json={'userId': 10, 'windowDays': 14, 'lessonMode': True},
        headers=headers,
    )

    assert response.status_code == 200
    generated_at = response.json().get('generatedAt')
    assert isinstance(generated_at, str)
    parsed = datetime.fromisoformat(generated_at.replace('Z', '+00:00'))
    assert parsed.tzinfo is not None
