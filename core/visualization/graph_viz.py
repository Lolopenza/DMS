import matplotlib.pyplot as plt
import networkx as nx

def visualize_graph(graph, title="Graph Visualization"):
    nx_graph = nx.DiGraph() if graph.directed else nx.Graph()
    
    nx_graph.add_nodes_from(graph.get_vertices())
    
    edge_labels = {}
    for edge in graph.get_edges():
        if len(edge) == 3:
            start, end, weight = edge
            nx_graph.add_edge(start, end, weight=weight)
            edge_labels[(start, end)] = weight
        else:
            start, end = edge
            nx_graph.add_edge(start, end)
            
    pos = nx.spring_layout(nx_graph)
    
    plt.figure(figsize=(10, 8))
    nx.draw(nx_graph, pos, with_labels=True, node_size=700, node_color='skyblue', font_size=10, font_weight='bold', arrows=graph.directed)
    
    if edge_labels:
        nx.draw_networkx_edge_labels(nx_graph, pos, edge_labels=edge_labels)
        
    plt.title(title)
    plt.show()

def sample_graph_to_cytoscape_json(graph):
    nodes = [{'data': {'id': str(node)}} for node in graph.nodes()]
    edges = [{'data': {'source': str(u), 'target': str(v)}} for u, v in graph.edges()]
    return {'nodes': nodes, 'edges': edges}

if __name__ == '__main__':
    from graph_theory.basics import Graph
    
    g = Graph()
    g.add_edge('A', 'B', 5)
    g.add_edge('A', 'C', 3)
    g.add_edge('B', 'C', 2)
    g.add_edge('C', 'D', 4)
    
    visualize_graph(g, "Sample Weighted Graph")
    
    g_dir = Graph(directed=True)
    g_dir.add_edge('X', 'Y')
    g_dir.add_edge('Y', 'Z')
    g_dir.add_edge('Z', 'X')
    
    visualize_graph(g_dir, "Sample Directed Graph")

    G = nx.Graph()
    G.add_edges_from([(1, 2), (1, 3), (2, 3), (3,4)])
    
    cytoscape_data = sample_graph_to_cytoscape_json(G)
    import json
    print(json.dumps(cytoscape_data, indent=2))
    G.add_edges_from([(1, 2), (1, 3), (2, 3), (3,4)])
    
    cytoscape_data = sample_graph_to_cytoscape_json(G)
    import json
    print(json.dumps(cytoscape_data, indent=2))
