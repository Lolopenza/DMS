def test_status(client):
    r = client.get('/api/v1/status')
    assert r.status_code == 200
    data = r.json()
    assert data['status'] == 'online'
    assert 'version' in data
    assert 'features' in data
    assert len(data['features']) > 0


def test_docs_available(client):
    r = client.get('/docs')
    assert r.status_code == 200


def test_openapi_json(client):
    r = client.get('/openapi.json')
    assert r.status_code == 200
    schema = r.json()
    assert 'paths' in schema
    assert len(schema['paths']) > 0
