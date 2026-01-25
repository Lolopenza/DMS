from flask import Flask, jsonify, request, send_from_directory
import os
import traceback

app = Flask(__name__)

@app.route('/')
def root():
    return jsonify({
        'service': 'Discrete Math MCP Server',
        'version': '1.0',
        'endpoints': ['/status', '/api/calculate', '/api/graph', '/api/adjacency_matrix', '/api/health', '/mcp.json'],
        'docs': 'https://github.com/your-repo/discrete-math-mcp'
    })

@app.route('/mcp.json')
def mcp_json():
    return send_from_directory(os.path.dirname(__file__), 'mcp.json', mimetype='application/json')

@app.route('/status')
def status():
    return jsonify({'status': 'MCP server running'})

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/favicon.ico')
def favicon():
    static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
    return send_from_directory(static_dir, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    try:
        data = request.get_json(force=True)
        operation = data.get('operation')
        args = data.get('args', {})
        if operation == 'factorial':
            n = int(args.get('n', 0))
            if n < 0 or n > 1000:
                return jsonify({'error': 'n out of range'}), 400
            from math import factorial
            return jsonify({'result': factorial(n)})
        elif operation == 'gcd':
            a = int(args.get('a', 0))
            b = int(args.get('b', 0))
            from math import gcd
            return jsonify({'result': gcd(a, b)})
        return jsonify({'error': 'Unknown operation'}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/api/graph', methods=['POST'])
def api_graph():
    try:
        data = request.get_json(force=True)
        action = data.get('action')
        graph = data.get('graph')
        if action == 'info':
            nodes = graph.get('nodes', [])
            edges = graph.get('edges', [])
            return jsonify({'node_count': len(nodes), 'edge_count': len(edges)})
        return jsonify({'error': 'Unknown graph action'}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/api/adjacency_matrix', methods=['POST'])
def api_adjacency_matrix():
    try:
        data = request.get_json(force=True)
        matrix = data.get('matrix')
        action = data.get('action')
        if not isinstance(matrix, list) or not matrix:
            return jsonify({'error': 'Invalid matrix'}), 400
        import numpy as np
        arr = np.array(matrix, dtype=int)
        if action == 'power':
            p = int(data.get('power', 1))
            result = np.linalg.matrix_power(arr, p).tolist()
            return jsonify({'result': result})
        elif action == 'degree':
            node = data.get('node')
            directed = bool(data.get('directed', False))
            if node is None or not (0 <= node < arr.shape[0]):
                return jsonify({'error': 'Invalid or missing node index'}), 400
            if directed:
                in_deg = int(arr[:, node].sum())
                out_deg = int(arr[node, :].sum())
                return jsonify({'result': {'in_degree': in_deg, 'out_degree': out_deg, 'total': in_deg + out_deg}})
            else:
                deg = int(arr[node, :].sum() + arr[:, node].sum())
                return jsonify({'result': {'degree': deg}})
        elif action == 'neighbors':
            node = data.get('node')
            directed = bool(data.get('directed', False))
            if node is None or not (0 <= node < arr.shape[0]):
                return jsonify({'error': 'Invalid or missing node index'}), 400
            if directed:
                out_neighbors = [int(j) for j in range(arr.shape[1]) if arr[node, j] != 0]
                in_neighbors = [int(i) for i in range(arr.shape[0]) if arr[i, node] != 0]
                return jsonify({'result': {'out_neighbors': out_neighbors, 'in_neighbors': in_neighbors}})
            else:
                neighbors = sorted(set([int(j) for j in range(arr.shape[1]) if arr[node, j] != 0] + [int(i) for i in range(arr.shape[0]) if arr[i, node] != 0]))
                return jsonify({'result': {'neighbors': neighbors}})
        return jsonify({'error': 'Unknown matrix action'}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found', 'message': str(e)}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)