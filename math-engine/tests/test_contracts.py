URL_COMBINATORICS = '/api/v1/combinatorics/'
URL_LOGIC = '/api/v1/logic/'
URL_STATUS = '/api/v1/status'


def assert_error_envelope(resp, expected_status: int, expected_code: str):
    assert resp.status_code == expected_status
    body = resp.json()
    assert 'error' in body

    err = body['error']
    assert err['status'] == expected_status
    assert err['code'] == expected_code
    assert isinstance(err.get('message'), str) and err['message']
    assert isinstance(err.get('path'), str) and err['path'].startswith('/api/v1/')
    assert isinstance(err.get('timestamp'), str) and err['timestamp']
    assert 'details' in err


# Contract: all responses include explicit API version header.
def test_api_version_header_present_on_success(client):
    resp = client.get(URL_STATUS)
    assert resp.status_code == 200
    assert resp.headers.get('x-api-version') == 'v1'


# Contract: domain-level HTTP errors must be wrapped in unified envelope.
def test_http_error_envelope_unknown_operation(client):
    resp = client.post(URL_COMBINATORICS, json={'operation': 'unknown_op'})
    assert_error_envelope(resp, 400, 'HTTP_ERROR')


# Contract: pydantic validation errors must be wrapped in unified envelope.
def test_validation_error_envelope_invalid_logic_operation(client):
    resp = client.post(URL_LOGIC, json={
        'operation': 'matrix_multiply',
        'variables': ['P'],
    })
    assert_error_envelope(resp, 422, 'VALIDATION_ERROR')


# Anti-lock-in: linear algebra payload should fail gracefully without schema crash.
def test_anti_lock_in_matrix_payload_graceful_error(client):
    resp = client.post(URL_COMBINATORICS, json={
        'operation': 'matrix_multiply',
        'matrix_a': [[1, 2], [3, 4]],
        'matrix_b': [[5, 6], [7, 8]],
    })
    assert_error_envelope(resp, 400, 'HTTP_ERROR')


# Anti-lock-in: vector norm shaped payload still yields neutral, versioned contract response.
def test_anti_lock_in_vector_norm_payload_enveloped(client):
    resp = client.post(URL_LOGIC, json={
        'operation': 'truth_table',
        'variables': ['v1'],
        'vector': [3, 4],
    })
    assert_error_envelope(resp, 422, 'VALIDATION_ERROR')
