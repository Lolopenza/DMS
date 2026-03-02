import pytest


URL = '/api/v1/set_theory/operations'


def test_union(client):
    r = client.post(URL, json={'operation': 'union', 'setA': [1, 2, 3], 'setB': [3, 4, 5]})
    assert r.status_code == 200
    assert set(r.json()['result']) == {1, 2, 3, 4, 5}


def test_intersection(client):
    r = client.post(URL, json={'operation': 'intersection', 'setA': [1, 2, 3], 'setB': [2, 3, 4]})
    assert r.status_code == 200
    assert set(r.json()['result']) == {2, 3}


def test_difference(client):
    r = client.post(URL, json={'operation': 'difference', 'setA': [1, 2, 3], 'setB': [2, 3]})
    assert r.status_code == 200
    assert set(r.json()['result']) == {1}


def test_symmetric_difference(client):
    r = client.post(URL, json={'operation': 'symmetric', 'setA': [1, 2, 3], 'setB': [3, 4, 5]})
    assert r.status_code == 200
    assert set(r.json()['result']) == {1, 2, 4, 5}


def test_subset_true(client):
    r = client.post(URL, json={'operation': 'subset', 'setA': [1, 2], 'setB': [1, 2, 3]})
    assert r.status_code == 200
    assert r.json()['result'] is True


def test_subset_false(client):
    r = client.post(URL, json={'operation': 'subset', 'setA': [1, 4], 'setB': [1, 2, 3]})
    assert r.status_code == 200
    assert r.json()['result'] is False


def test_complement(client):
    r = client.post(URL, json={
        'operation': 'complement',
        'setC': [1, 2],
        'universe': [1, 2, 3, 4, 5],
    })
    assert r.status_code == 200
    assert set(r.json()['result']) == {3, 4, 5}


def test_complement_missing_universe_returns_400(client):
    r = client.post(URL, json={'operation': 'complement', 'setC': [1, 2]})
    assert r.status_code == 400


def test_cartesian_product(client):
    r = client.post(URL, json={'operation': 'cartesian', 'setA': [1, 2], 'setB': ['a', 'b']})
    assert r.status_code == 200
    assert len(r.json()['result']) == 4


def test_power_set(client):
    r = client.post(URL, json={'operation': 'power', 'setC': [1, 2, 3]})
    assert r.status_code == 200
    assert len(r.json()['result']) == 8


def test_cardinality(client):
    r = client.post(URL, json={'operation': 'cardinality', 'setC': [1, 2, 3, 4]})
    assert r.status_code == 200
    assert r.json()['result'] == 4


def test_empty_set(client):
    r = client.post(URL, json={'operation': 'empty', 'setC': []})
    assert r.status_code == 200
    assert r.json()['result'] is True


def test_unknown_operation_returns_400(client):
    r = client.post(URL, json={'operation': 'invalid_op', 'setA': [1]})
    assert r.status_code == 400
