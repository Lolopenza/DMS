import os

import api.v1.colab_export as colab_export


def test_colab_starter_notebook_structure(client):
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')
    headers = {'X-Internal-Api-Key': internal_key} if internal_key else {}
    response = client.post('/api/v1/colab/starter', json={'userId': 1, 'windowDays': 30}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data.get('filename', '').endswith('.ipynb')
    notebook = data.get('notebook', '')
    assert '"nbformat"' in notebook
    assert 'Logistic regression' in notebook
    assert 'K-Means' in notebook
    assert 'Mini-BKT' in notebook
    assert 'Linear trend of performance' in notebook
    assert 'does not embed access tokens or internal API keys' in notebook
    assert 'Lesson mode (AI Tutor)' in notebook
    assert 'Reflection task' in notebook


def test_colab_starter_lesson_mode_disabled(client):
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


def test_colab_starter_lesson_mode_fallback_when_llm_unavailable(client, monkeypatch):
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
