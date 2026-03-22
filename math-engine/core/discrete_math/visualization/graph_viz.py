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

