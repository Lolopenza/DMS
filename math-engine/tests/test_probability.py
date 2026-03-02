import pytest


URL = '/api/v1/probability/'


def test_simple_probability(client):
    r = client.post(URL, json={'operation': 'simple', 'favorable': 3, 'total': 6})
    assert r.status_code == 200
    assert abs(r.json()['result'] - 0.5) < 1e-9


def test_simple_invalid_values(client):
    r = client.post(URL, json={'operation': 'simple', 'favorable': 10, 'total': 5})
    assert r.status_code == 400


def test_conditional(client):
    r = client.post(URL, json={'operation': 'conditional', 'joint': 0.2, 'condition': 0.5})
    assert r.status_code == 200
    assert abs(r.json()['result'] - 0.4) < 1e-9


def test_bayes(client):
    r = client.post(URL, json={
        'operation': 'bayes',
        'prior': 0.01,
        'true_pos': 0.9,
        'false_pos': 0.1,
    })
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_binomial_pmf(client):
    r = client.post(URL, json={'operation': 'binomial_pmf', 'n': 10, 'p': 0.5, 'k': 5})
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_poisson_pmf(client):
    r = client.post(URL, json={'operation': 'poisson_pmf', 'lambda_': 3.0, 'k': 2})
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_geometric_pmf(client):
    r = client.post(URL, json={'operation': 'geometric_pmf', 'p': 0.3, 'k': 4})
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_hypergeometric(client):
    r = client.post('/api/v1/probability/hypergeometric', json={'M': 20, 'n': 7, 'N': 5, 'k': 2})
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_negative_binomial(client):
    r = client.post('/api/v1/probability/negative_binomial', json={'n': 5, 'p': 0.5, 'k': 3})
    assert r.status_code == 200
    assert 0 < r.json()['result'] < 1


def test_joint_probability(client):
    r = client.post('/api/v1/probability/joint', json={'probs': [0.5, 0.3, 0.8]})
    assert r.status_code == 200
    assert abs(r.json()['result'] - 0.12) < 1e-9


def test_joint_invalid_probs(client):
    r = client.post('/api/v1/probability/joint', json={'probs': [0.5, 1.5]})
    assert r.status_code == 400


def test_custom_pmf(client):
    r = client.post('/api/v1/probability/custom_pmf', json={
        'values': [1, 2, 3],
        'probs': [0.2, 0.5, 0.3],
    })
    assert r.status_code == 200
    data = r.json()
    assert 'mean' in data
    assert 'variance' in data
    assert abs(data['mean'] - 2.1) < 1e-9


def test_venn_two_sets(client):
    r = client.post('/api/v1/probability/venn', json={
        'sets': {'A': [1, 2, 3], 'B': [2, 3, 4]},
    })
    assert r.status_code == 200
    assert 'image' in r.json()


def test_unknown_operation_returns_400(client):
    r = client.post(URL, json={'operation': 'unknown'})
    assert r.status_code == 400
