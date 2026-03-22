import pytest


URL = '/api/v1/graph_theory/'

SIMPLE_GRAPH = {
    'vertices': ['A', 'B', 'C', 'D'],
    'edges': [
        {'u': 'A', 'v': 'B'},
        {'u': 'A', 'v': 'C'},
        {'u': 'B', 'v': 'D'},
    ],
    'directed': False,
}

WEIGHTED_GRAPH = {
    'vertices': ['A', 'B', 'C'],
    'edges': [
        {'u': 'A', 'v': 'B', 'weight': 1},
        {'u': 'B', 'v': 'C', 'weight': 2},
        {'u': 'A', 'v': 'C', 'weight': 4},
    ],
    'directed': True,
}


def test_bfs(client):
    r = client.post(URL, json={'operation': 'bfs', 'graph': SIMPLE_GRAPH, 'start_node': 'A'})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'A' in result
    assert 'B' in result


def test_dfs(client):
    r = client.post(URL, json={'operation': 'dfs', 'graph': SIMPLE_GRAPH, 'start_node': 'A'})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'A' in result


def test_connected_components(client):
    r = client.post(URL, json={'operation': 'connected_components', 'graph': SIMPLE_GRAPH})
    assert r.status_code == 200
    assert isinstance(r.json()['result'], list)


def test_has_cycle_false(client):
    r = client.post(URL, json={'operation': 'has_cycle', 'graph': SIMPLE_GRAPH})
    assert r.status_code == 200
    assert isinstance(r.json()['result'], bool)


def test_has_cycle_true(client):
    cyclic_graph = {
        'vertices': ['A', 'B', 'C'],
        'edges': [{'u': 'A', 'v': 'B'}, {'u': 'B', 'v': 'C'}, {'u': 'C', 'v': 'A'}],
        'directed': False,
    }
    r = client.post(URL, json={'operation': 'has_cycle', 'graph': cyclic_graph})
    assert r.status_code == 200
    assert r.json()['result'] is True


def test_dijkstra(client):
    r = client.post(URL, json={'operation': 'dijkstra', 'graph': WEIGHTED_GRAPH, 'start_node': 'A'})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'distances' in result
    assert 'predecessors' in result
    assert result['distances']['A'] == 0


def test_kruskal(client):
    undirected_weighted = {
        'vertices': ['A', 'B', 'C'],
        'edges': [
            {'u': 'A', 'v': 'B', 'weight': 1},
            {'u': 'B', 'v': 'C', 'weight': 2},
            {'u': 'A', 'v': 'C', 'weight': 4},
        ],
        'directed': False,
    }
    r = client.post(URL, json={'operation': 'kruskal', 'graph': undirected_weighted})
    assert r.status_code == 200
    result = r.json()['result']
    assert 'edges' in result
    assert 'total_weight' in result
    assert result['total_weight'] == 3


def test_unknown_operation_returns_400(client):
    r = client.post(URL, json={'operation': 'unknown', 'graph': SIMPLE_GRAPH})
    assert r.status_code == 400
