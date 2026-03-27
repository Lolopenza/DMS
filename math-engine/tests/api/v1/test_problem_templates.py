def test_given_valid_numeric_template_when_validate_called_then_returns_correct_true(client):
    response = client.post(
        '/api/v1/problem_templates/validate',
        json={
            'operation': 'sum',
            'answerExpression': '{{a}} + {{b}}',
            'params': {'a': 2, 'b': 3},
            'candidateAnswer': 5,
        },
    )
    assert response.status_code == 200
    assert response.json()['correct'] is True


def test_given_boolean_template_when_validate_called_then_compares_boolean_expression(client):
    response = client.post(
        '/api/v1/problem_templates/validate',
        json={
            'operation': 'logic',
            'answerExpression': '1',
            'params': {},
            'candidateAnswer': True,
        },
    )
    assert response.status_code == 200
    assert response.json()['correct'] is True


def test_given_invalid_expression_when_validate_called_then_returns_400(client):
    response = client.post(
        '/api/v1/problem_templates/validate',
        json={
            'operation': 'broken',
            'answerExpression': '{{a}} + )',
            'params': {'a': 1},
            'candidateAnswer': 1,
        },
    )
    assert response.status_code == 400
    payload = response.json()
    assert payload['error']['code'] == 'HTTP_ERROR'


def test_given_malicious_payload_when_validate_called_then_returns_400_without_crash(client):
    response = client.post(
        '/api/v1/problem_templates/validate',
        json={
            'operation': 'unsafe',
            'answerExpression': '__import__("os").system("echo hacked")',
            'params': {},
            'candidateAnswer': 1,
        },
    )
    assert response.status_code == 400
    payload = response.json()
    assert payload['error']['code'] == 'HTTP_ERROR'
