import pytest


MATRIX_3x3 = [[0, 1, 0], [1, 0, 1], [0, 1, 0]]
MATRIX_DIRECTED = [[0, 1, 1], [0, 0, 1], [0, 0, 0]]


def test_matrix_power(client):
    r = client.post('/api/v1/adjacency_matrix/power', json={'matrix': MATRIX_3x3, 'power': 2})
    assert r.status_code == 200
    assert r.json()['result'] is not None


def test_matrix_degree_undirected(client):
    r = client.post('/api/v1/adjacency_matrix/degree', json={
        'matrix': MATRIX_3x3, 'node': 1, 'directed': False,
    })
    assert r.status_code == 200
    assert r.json()['result']['degree'] == 4


def test_matrix_degree_directed(client):
    r = client.post('/api/v1/adjacency_matrix/degree', json={
        'matrix': MATRIX_DIRECTED, 'node': 0, 'directed': True,
    })
    assert r.status_code == 200
    result = r.json()['result']
    assert 'in_degree' in result
    assert 'out_degree' in result


def test_matrix_neighbors_undirected(client):
    r = client.post('/api/v1/adjacency_matrix/neighbors', json={
        'matrix': MATRIX_3x3, 'node': 0, 'directed': False,
    })
    assert r.status_code == 200
    assert 1 in r.json()['result']['neighbors']


def test_to_adjacency_list(client):
    r = client.post('/api/v1/adjacency_matrix/to_adjacency_list', json={'matrix': MATRIX_3x3})
    assert r.status_code == 200
    assert '0' in r.json()['result']


def test_to_edge_list(client):
    r = client.post('/api/v1/adjacency_matrix/to_edge_list', json={'matrix': MATRIX_3x3})
    assert r.status_code == 200
    assert isinstance(r.json()['result'], list)


def test_validate_symmetric(client):
    r = client.post('/api/v1/adjacency_matrix/validate', json={'matrix': MATRIX_3x3})
    assert r.status_code == 200
    result = r.json()['result']
    assert result['square'] is True
    assert result['symmetric'] is True


def test_validate_not_symmetric(client):
    r = client.post('/api/v1/adjacency_matrix/validate', json={'matrix': MATRIX_DIRECTED})
    assert r.status_code == 200
    assert r.json()['result']['symmetric'] is False


def test_batch_analysis_undirected(client):
    r = client.post('/api/v1/adjacency_matrix/batch_analysis', json={
        'matrix': MATRIX_3x3, 'directed': False,
    })
    assert r.status_code == 200
    results = r.json()['result']
    assert len(results) == 3
    assert 'degree' in results[0]


def test_invalid_node_returns_400(client):
    r = client.post('/api/v1/adjacency_matrix/degree', json={
        'matrix': MATRIX_3x3, 'node': 99, 'directed': False,
    })
    assert r.status_code == 400
