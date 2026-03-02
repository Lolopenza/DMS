import pytest


URL = '/api/v1/number_theory/'


def test_gcd(client):
    r = client.post(URL, json={'operation': 'gcd', 'a': 48, 'b': 18})
    assert r.status_code == 200
    assert r.json()['result'] == 6


def test_lcm(client):
    r = client.post(URL, json={'operation': 'lcm', 'a': 12, 'b': 8})
    assert r.status_code == 200
    assert r.json()['result'] == 24


def test_divisors(client):
    r = client.post(URL, json={'operation': 'divisors', 'n': 12})
    assert r.status_code == 200
    assert set(r.json()['result']) == {1, 2, 3, 4, 6, 12}


def test_factorize(client):
    r = client.post(URL, json={'operation': 'factorize', 'n': 12})
    assert r.status_code == 200
    assert isinstance(r.json()['result'], (dict, list))


def test_totient(client):
    r = client.post(URL, json={'operation': 'totient', 'n': 12})
    assert r.status_code == 200
    assert r.json()['result'] == 4


def test_mod_exp(client):
    r = client.post(URL, json={'operation': 'mod_exp', 'base': 2, 'exponent': 10, 'modulus': 1000})
    assert r.status_code == 200
    assert r.json()['result'] == 24


def test_mod_inv(client):
    r = client.post(URL, json={'operation': 'mod_inv', 'a': 3, 'm': 11})
    assert r.status_code == 200
    assert r.json()['result'] == 4


def test_crt(client):
    r = client.post(URL, json={
        'operation': 'crt',
        'remainders': [2, 3, 2],
        'moduli': [3, 5, 7],
    })
    assert r.status_code == 200
    assert r.json()['result'] == 23


def test_rsa_generate(client):
    r = client.post(URL, json={'operation': 'rsa_generate', 'bits': 16})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'public' in result
    assert 'private' in result


def test_rsa_encrypt_decrypt(client):
    gen = client.post(URL, json={'operation': 'rsa_generate', 'bits': 16}).json()['result']
    n = gen['public'][0]
    e = gen['public'][1]
    d = gen['private'][1]
    message = 42
    enc = client.post(URL, json={'operation': 'rsa_encrypt', 'message': message, 'e': e, 'n': n})
    assert enc.status_code == 200
    ciphertext = enc.json()['result']
    dec = client.post(URL, json={'operation': 'rsa_decrypt', 'ciphertext': ciphertext, 'd': d, 'n': n})
    assert dec.status_code == 200
    assert dec.json()['result'] == message


def test_unknown_operation_returns_400(client):
    r = client.post(URL, json={'operation': 'unknown'})
    assert r.status_code == 400
