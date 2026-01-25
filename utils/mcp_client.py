import os
import requests

MCP_SERVER_URL = os.environ.get('MCP_SERVER_URL', 'http://127.0.0.1:5050')
MCP_TIMEOUT = float(os.environ.get('MCP_TIMEOUT', 3.0))

class MCPError(Exception):
    pass

def get_mcp_info():
    try:
        resp = requests.get(f'{MCP_SERVER_URL}/mcp.json', timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise MCPError(f'MCP discovery failed: {e}')

def calculate(operation, args):
    try:
        resp = requests.post(f'{MCP_SERVER_URL}/api/calculate', json={"operation": operation, "args": args}, timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        if 'result' in data:
            return data['result']
        raise MCPError(data.get('error', 'Unknown MCP error'))
    except Exception as e:
        raise MCPError(f'MCP calculate failed: {e}')

def adjacency_matrix_power(matrix, power):
    try:
        resp = requests.post(f'{MCP_SERVER_URL}/api/adjacency_matrix', json={"action": "power", "matrix": matrix, "power": power}, timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        if 'result' in data:
            return data['result']
        raise MCPError(data.get('error', 'Unknown MCP error'))
    except Exception as e:
        raise MCPError(f'MCP adjacency_matrix failed: {e}')

def graph_info(graph):
    try:
        resp = requests.post(f'{MCP_SERVER_URL}/api/graph', json={"action": "info", "graph": graph}, timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        return data
    except Exception as e:
        raise MCPError(f'MCP graph failed: {e}')

def adjacency_matrix_degree(matrix, node, directed=False):
    try:
        resp = requests.post(f'{MCP_SERVER_URL}/api/adjacency_matrix', json={"action": "degree", "matrix": matrix, "node": node, "directed": directed}, timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        if 'result' in data:
            return data['result']
        raise MCPError(data.get('error', 'Unknown MCP error'))
    except Exception as e:
        raise MCPError(f'MCP adjacency_matrix degree failed: {e}')

def adjacency_matrix_neighbors(matrix, node, directed=False):
    try:
        resp = requests.post(f'{MCP_SERVER_URL}/api/adjacency_matrix', json={"action": "neighbors", "matrix": matrix, "node": node, "directed": directed}, timeout=MCP_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        if 'result' in data:
            return data['result']
        raise MCPError(data.get('error', 'Unknown MCP error'))
    except Exception as e:
        raise MCPError(f'MCP adjacency_matrix neighbors failed: {e}')