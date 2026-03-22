import pytest


URL = '/api/v1/logic/'


def test_truth_table(client):
    r = client.post(URL, json={
        'operation': 'truth_table',
        'variables': ['P', 'Q'],
        'formula': 'P & Q',
    })
    assert r.status_code == 200
    assert 'result' in r.json()


def test_truth_table_or(client):
    r = client.post(URL, json={
        'operation': 'truth_table',
        'variables': ['P', 'Q'],
        'formula': 'P | Q',
    })
    assert r.status_code == 200


def test_equivalence_true(client):
    r = client.post(URL, json={
        'operation': 'equivalence',
        'variables': ['P', 'Q'],
        'formula1': 'P | Q',
        'formula2': 'Q | P',
    })
    assert r.status_code == 200
    assert r.json()['result'] is True


def test_equivalence_false(client):
    r = client.post(URL, json={
        'operation': 'equivalence',
        'variables': ['P', 'Q'],
        'formula1': 'P & Q',
        'formula2': 'P | Q',
    })
    assert r.status_code == 200
    assert r.json()['result'] is False


def test_missing_variables_returns_422(client):
    r = client.post(URL, json={
        'operation': 'truth_table',
        'formula': 'P & Q',
    })
    assert r.status_code == 422


def test_missing_formula_returns_400(client):
    r = client.post(URL, json={
        'operation': 'truth_table',
        'variables': ['P', 'Q'],
    })
    assert r.status_code == 400


def test_invalid_operation_returns_422(client):
    r = client.post(URL, json={
        'operation': 'unknown',
        'variables': ['P'],
    })
    assert r.status_code == 422


def test_formula_uses_unlisted_variable_returns_400(client):
    r = client.post(URL, json={
        'operation': 'truth_table',
        'variables': ['P'],
        'formula': 'P & Q',
    })
    assert r.status_code == 400


def test_formula_analysis(client):
    r = client.post(URL, json={
        'operation': 'formula_analysis',
        'variables': ['P', 'Q'],
        'formula': '(P -> Q) & P',
    })
    assert r.status_code == 200
    result = r.json()['result']
    assert 'classification' in result
    assert 'true_rows' in result
    assert 'false_rows' in result


def test_implication_valid(client):
    r = client.post(URL, json={
        'operation': 'implication',
        'variables': ['P', 'Q'],
        'formula1': 'P & Q',
        'formula2': 'P',
    })
    assert r.status_code == 200
    assert r.json()['result']['valid'] is True


def test_normal_forms(client):
    r = client.post(URL, json={
        'operation': 'normal_forms',
        'variables': ['P', 'Q'],
        'formula': 'P -> Q',
    })
    assert r.status_code == 200
    result = r.json()['result']
    assert 'dnf' in result
    assert 'cnf' in result
