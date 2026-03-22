URL = '/api/v1/linear_algebra/'


def test_vectors_dot_product(client):
    r = client.post(URL, json={
        'module': 'vectors',
        'operation': 'dot-product',
        'a': [1, 2, 3],
        'b': [3, 2, 1],
    })
    assert r.status_code == 200
    assert r.json()['result']['value'] == 10


def test_matrices_multiply(client):
    r = client.post(URL, json={
        'module': 'matrices',
        'operation': 'multiply',
        'a': [[1, 2], [3, 4]],
        'b': [[2, 0], [1, 2]],
    })
    assert r.status_code == 200
    assert r.json()['result']['value'] == [[4.0, 4.0], [10.0, 8.0]]


def test_unknown_linear_module_returns_400(client):
    r = client.post(URL, json={'module': 'unknown', 'operation': 'x'})
    assert r.status_code == 400
