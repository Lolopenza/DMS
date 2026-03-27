import api.v1.chat as chat_api


def test_given_empty_messages_when_chat_called_then_returns_400(client):
    response = client.post('/api/v1/chat', json={'messages': []})
    assert response.status_code == 400
    payload = response.json()
    assert payload['error']['code'] == 'HTTP_ERROR'


def test_given_llm_rate_limit_error_when_chat_called_then_propagates_status_code(client, monkeypatch):
    class _FailingChatbot:
        def chat(self, *_args, **_kwargs):
            return {'error': 'rate limit', 'status': 429}

    monkeypatch.setattr(chat_api, 'get_chatbot_service', lambda: _FailingChatbot())

    response = client.post(
        '/api/v1/chat',
        json={'messages': [{'role': 'user', 'content': 'hello'}], 'subject': 'logic'},
    )
    assert response.status_code == 429


def test_given_valid_chat_request_when_chat_called_then_returns_model_reply(client, monkeypatch):
    class _OkChatbot:
        def chat(self, *_args, **_kwargs):
            return {'reply': 'ok', 'model': 'stub'}

    monkeypatch.setattr(chat_api, 'get_chatbot_service', lambda: _OkChatbot())

    response = client.post(
        '/api/v1/chat',
        json={'messages': [{'role': 'user', 'content': 'hello'}], 'subject': 'logic', 'module': 'intro'},
    )
    assert response.status_code == 200
    assert response.json()['reply'] == 'ok'
