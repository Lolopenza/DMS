import api.v1.problem_generation as pg


def test_given_markdown_wrapped_json_when_cleaning_llm_payload_then_extracts_raw_json():
    wrapped = """```json
{"questionText":"Q","parameters":{"n":5},"answerExpression":"{{n}}","operation":"id","correctAnswer":5}
```"""
    cleaned = pg._clean_llm_json(wrapped)
    assert cleaned.startswith('{')
    assert '"questionText"' in cleaned


def test_given_llm_error_when_generate_called_then_returns_fallback_payload(client, monkeypatch):
    class _FailingChatbot:
        def chat(self, *_args, **_kwargs):
            return {'error': 'llm unavailable'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _FailingChatbot())

    response = client.post('/api/v1/problem_generation/generate', json={'topicSlug': 'logic', 'difficulty': 'HARD'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['sourceModel'] == 'fallback-template'
    assert 'llmError' in payload


def test_given_invalid_llm_json_when_generate_called_then_returns_fallback_with_raw_reply(client, monkeypatch):
    class _BrokenChatbot:
        def chat(self, *_args, **_kwargs):
            return {'reply': 'not a json payload'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _BrokenChatbot())

    response = client.post('/api/v1/problem_generation/generate', json={'topicSlug': 'combinatorics'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['sourceModel'] == 'fallback-template'
    assert 'rawReply' in payload


def test_given_symbolic_expression_when_verify_called_then_uses_symbolic_method(client):
    response = client.post(
        '/api/v1/problem_generation/verify',
        json={
            'questionText': '2 + 2 = ?',
            'candidateAnswer': 4,
            'answerExpression': '{{a}} + {{b}}',
            'operation': 'sum',
            'params': {'a': 2, 'b': 2},
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['correct'] is True
    assert payload['method'] == 'symbolic'


def test_given_llm_error_and_expected_answer_when_verify_called_then_uses_semantic_fallback(client, monkeypatch):
    class _FailingChatbot:
        def chat(self, *_args, **_kwargs):
            return {'error': 'timeout'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _FailingChatbot())

    response = client.post(
        '/api/v1/problem_generation/verify',
        json={
            'questionText': '2 + 2 = ?',
            'candidateAnswer': '4',
            'expectedAnswer': '4',
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['correct'] is True
    assert payload['method'] == 'semantic-fallback'


def test_given_llm_error_when_fractional_answers_are_equivalent_then_semantic_fallback_marks_correct(client, monkeypatch):
    class _FailingChatbot:
        def chat(self, *_args, **_kwargs):
            return {'error': 'timeout'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _FailingChatbot())

    for expected, candidate in [('1/2', '0.5'), ('2/4', '1/2')]:
        response = client.post(
            '/api/v1/problem_generation/verify',
            json={
                'questionText': 'Equivalent fraction check',
                'candidateAnswer': candidate,
                'expectedAnswer': expected,
            },
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload['correct'] is True
        assert payload['method'] == 'semantic-fallback'


def test_given_llm_reply_with_string_boolean_when_verify_called_then_does_not_treat_false_as_true(client, monkeypatch):
    class _StringBoolJudge:
        def chat(self, *_args, **_kwargs):
            return {'reply': '{"correct":"false","confidence":0.9,"feedback":"Wrong"}'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _StringBoolJudge())

    response = client.post(
        '/api/v1/problem_generation/verify',
        json={
            'questionText': '2 + 2 = ?',
            'candidateAnswer': '5',
            'expectedAnswer': '4',
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['correct'] is False
    assert payload['method'] == 'semantic-fallback'


def test_given_malicious_expression_payload_when_verify_called_then_endpoint_does_not_crash(client, monkeypatch):
    class _FailingChatbot:
        def chat(self, *_args, **_kwargs):
            return {'error': 'timeout'}

    monkeypatch.setattr(pg, 'get_chatbot_service', lambda: _FailingChatbot())

    response = client.post(
        '/api/v1/problem_generation/verify',
        json={
            'questionText': 'Unsafe payload check',
            'candidateAnswer': '__import__("os").system("echo hacked")',
            'expectedAnswer': '1',
            'answerExpression': '{{a}} + 0',
            'operation': 'sum',
            'params': {'a': 1},
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['correct'] is False
