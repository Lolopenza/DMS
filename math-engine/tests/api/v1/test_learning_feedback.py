import types

import api.v1.learning_feedback as lf


def test_prompt_builder_does_not_leak_bkt_or_probabilities():
    summary = {
        'skills': [
            {'topicSlug': 'trigonometry', 'pKnow': 0.85},
            {'topicSlug': 'logarithms', 'pKnow': 0.40},
            {'topicSlug': 'derivatives', 'pKnow': 0.15},
        ],
        'attemptAggregates': {'generatedAttemptsTotal': 10, 'generatedAttemptsIncorrect': 4},
    }
    prompts = lf._build_feedback_prompt(summary, top_n=2)
    assert 'BKT' not in prompts['system']
    assert 'Bayesian' not in prompts['system']
    assert 'probabilit' not in prompts['system'].lower()


def test_learning_feedback_endpoint_returns_fallback_on_llm_error(client, monkeypatch):
    class _FakeResponse:
        status_code = 200

        def json(self):
            return {
                'skills': [
                    {'topicSlug': 'trigonometry', 'pKnow': 0.85},
                    {'topicSlug': 'logarithms', 'pKnow': 0.40},
                    {'topicSlug': 'derivatives', 'pKnow': 0.15},
                ],
                'attemptAggregates': {
                    'generatedAttemptsTotal': 7,
                    'generatedAttemptsIncorrect': 3,
                    'avgTimeSpentSeconds': 120,
                },
                'topicKpis': [
                    {'topicSlug': 'trigonometry', 'successRate': 0.8},
                    {'topicSlug': 'derivatives', 'successRate': 0.2},
                ],
            }

        @property
        def text(self):
            return ''

    class _FakeHttpxClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def get(self, *args, **kwargs):
            return _FakeResponse()

    class _FakeChatbot:
        def chat(self, *args, **kwargs):
            return {'error': 'LLM unavailable'}

    monkeypatch.setattr(lf.httpx, 'Client', _FakeHttpxClient)
    monkeypatch.setattr(lf, 'get_chatbot_service', lambda: _FakeChatbot())

    r = client.post('/api/v1/learning/feedback', json={'userId': 1, 'windowDays': 30, 'topNTopics': 2})
    assert r.status_code == 200
    data = r.json()
    assert 'feedbackText' in data
    assert isinstance(data.get('focusTopics'), list)
    assert isinstance(data.get('strengths'), list)
    assert isinstance(data.get('recommendations'), list)
    assert data['feedbackText'].strip() != ''


def test_learning_feedback_min_attempts_guardrail(client, monkeypatch):
    class _FakeResponse:
        status_code = 200

        def json(self):
            return {
                'skills': [
                    {'topicSlug': 'logic', 'pKnow': 0.6},
                ],
                'attemptAggregates': {
                    'generatedAttemptsTotal': 1,
                    'generatedAttemptsIncorrect': 1,
                },
            }

        @property
        def text(self):
            return ''

    class _FakeHttpxClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def get(self, *args, **kwargs):
            return _FakeResponse()

    monkeypatch.setattr(lf.httpx, 'Client', _FakeHttpxClient)
    monkeypatch.setenv('DMC_MIN_ATTEMPTS_FOR_FEEDBACK', '5')

    r = client.post('/api/v1/learning/feedback', json={'userId': 1, 'windowDays': 30, 'topNTopics': 2})
    assert r.status_code == 200
    data = r.json()
    assert 'need a bit more data' in data.get('feedbackText', '').lower()
    assert 'recommendations' not in data


def test_structured_recommendations_include_hint_and_schedule_patterns():
    summary = {
        'topicKpis': [
            {'topicSlug': 'logic', 'successRate': 0.2},
            {'topicSlug': 'graph_theory', 'successRate': 0.9},
        ]
    }
    raw_attempts = [
        {'hintUsed': True, 'lateNight': True},
        {'hintUsed': True, 'lateNight': True},
        {'hintUsed': False, 'lateNight': True},
        {'hintUsed': True, 'lateNight': False},
        {'hintUsed': False, 'lateNight': False},
    ]
    recs = lf._build_structured_recommendations(summary, raw_attempts)
    rec_types = {r.get('type') for r in recs}
    assert {'weak_topic', 'hint_dependency', 'schedule'}.issubset(rec_types)

