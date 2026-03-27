URL = '/api/v1/algorithms/'


def test_given_quick_sort_payload_when_algorithms_endpoint_called_then_returns_sorted_array(client):
    r = client.post(URL, json={
        'module': 'sorting',
        'operation': 'quick-sort',
        'array': [5, 1, 4, 2, 8],
    })
    assert r.status_code == 200
    assert r.json()['result']['sorted'] == [1.0, 2.0, 4.0, 5.0, 8.0]


def test_given_binary_search_payload_when_algorithms_endpoint_called_then_returns_found_true(client):
    r = client.post(URL, json={
        'module': 'searching',
        'operation': 'binary-search',
        'array': [10, 20, 30, 40, 50],
        'target': 30,
    })
    assert r.status_code == 200
    assert r.json()['result']['found'] is True


def test_given_unknown_algorithms_module_when_endpoint_called_then_returns_400(client):
    r = client.post(URL, json={'module': 'unknown', 'operation': 'x'})
    assert r.status_code == 400
