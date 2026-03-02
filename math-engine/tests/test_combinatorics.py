import pytest


URL = '/api/v1/combinatorics/'


def test_factorial(client):
    r = client.post(URL, json={'operation': 'factorial', 'n': 5})
    assert r.status_code == 200
    assert r.json()['result'] == 120


def test_factorial_zero(client):
    r = client.post(URL, json={'operation': 'factorial', 'n': 0})
    assert r.status_code == 200
    assert r.json()['result'] == 1


def test_permutation(client):
    r = client.post(URL, json={'operation': 'permutation', 'n': 5, 'r': 2})
    assert r.status_code == 200
    assert r.json()['result'] == 20


def test_combination(client):
    r = client.post(URL, json={'operation': 'combination', 'n': 5, 'r': 2})
    assert r.status_code == 200
    assert r.json()['result'] == 10


def test_binomial(client):
    r = client.post(URL, json={'operation': 'binomial', 'n': 5, 'k': 2})
    assert r.status_code == 200
    assert r.json()['result'] == 10


def test_catalan(client):
    r = client.post(URL, json={'operation': 'catalan', 'n': 4})
    assert r.status_code == 200
    assert r.json()['result'] == 14


def test_stirling(client):
    r = client.post(URL, json={'operation': 'stirling', 'n': 4, 'k': 2})
    assert r.status_code == 200
    assert r.json()['result'] == 7


def test_pigeonhole(client):
    r = client.post(URL, json={'operation': 'pigeonhole', 'pigeons': 10, 'holes': 3})
    assert r.status_code == 200


def test_missing_n_returns_400(client):
    r = client.post(URL, json={'operation': 'factorial'})
    assert r.status_code == 400


def test_unknown_operation_returns_400(client):
    r = client.post(URL, json={'operation': 'unknown_op', 'n': 5})
    assert r.status_code == 400


def test_missing_operation_returns_422(client):
    r = client.post(URL, json={'n': 5})
    assert r.status_code == 422
