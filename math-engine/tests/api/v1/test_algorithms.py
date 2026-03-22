URL = '/api/v1/algorithms/'


def test_sorting_quick_sort(client):
    r = client.post(URL, json={
        'module': 'sorting',
        'operation': 'quick-sort',
        'array': [5, 1, 4, 2, 8],
    })
    assert r.status_code == 200
    assert r.json()['result']['sorted'] == [1.0, 2.0, 4.0, 5.0, 8.0]


def test_searching_binary_search(client):
    r = client.post(URL, json={
        'module': 'searching',
        'operation': 'binary-search',
        'array': [10, 20, 30, 40, 50],
        'target': 30,
    })
    assert r.status_code == 200
    assert r.json()['result']['found'] is True


def test_unknown_algorithms_module_returns_400(client):
    r = client.post(URL, json={'module': 'unknown', 'operation': 'x'})
    assert r.status_code == 400
