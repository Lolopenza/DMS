from fastapi import APIRouter, HTTPException
from schemas.graph_schemas import GraphTheoryRequest
from core.graph_theory.basics import Graph
from core.graph_theory.algorithms import (
    depth_first_search, breadth_first_search, find_connected_components,
    has_cycle, has_cycle_undirected, kruskal_mst, dijkstra,
)

router = APIRouter(prefix='/api/v1/graph_theory', tags=['Graph Theory'])


def build_graph(graph_data) -> Graph:
    g = Graph(directed=graph_data.directed)
    for v in graph_data.vertices:
        g.add_vertex(v)
    for edge in graph_data.edges:
        g.add_edge(edge['u'], edge['v'], edge.get('weight'))
    return g


@router.post('/')
def graph_calculate(req: GraphTheoryRequest):
    graph = build_graph(req.graph)
    op = req.operation

    if op == 'dfs':
        return {'result': depth_first_search(graph, req.start_node)}
    if op == 'bfs':
        return {'result': breadth_first_search(graph, req.start_node)}
    if op == 'connected_components':
        return {'result': find_connected_components(graph)}
    if op == 'has_cycle':
        result = has_cycle(graph) if graph.directed else has_cycle_undirected(graph)
        return {'result': result}
    if op == 'kruskal':
        edges, total_weight = kruskal_mst(graph)
        return {'result': {'edges': edges, 'total_weight': total_weight}}
    if op == 'dijkstra':
        result = dijkstra(graph, req.start_node)
        if isinstance(result, tuple):
            distances, predecessors = result
        else:
            distances, predecessors = result, {}
        return {'result': {'distances': distances, 'predecessors': predecessors}}

    raise HTTPException(400, f'Unknown operation: {op}')
