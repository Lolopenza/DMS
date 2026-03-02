from collections import deque
import heapq 

from .basics import Graph 

class DSU:
    def __init__(self, vertices):
        self.parent = {v: v for v in vertices}
        self.rank = {v: 0 for v in vertices}

    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i]) 
        return self.parent[i]

    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            if self.rank[root_i] < self.rank[root_j]:
                self.parent[root_i] = root_j
            elif self.rank[root_i] > self.rank[root_j]:
                self.parent[root_j] = root_i
            else:
                self.parent[root_j] = root_i
                self.rank[root_i] += 1
            return True 
        return False 

def depth_first_search(graph, start_vertex):
    if start_vertex not in graph.adjacency_list:
        raise ValueError(f"Start vertex '{start_vertex}' not in graph")
        
    visited = set()
    dfs_order = []
    
    def dfs_recursive(vertex):
        visited.add(vertex)
        dfs_order.append(vertex)
        for neighbor in graph.get_neighbors(vertex):
            if neighbor not in visited:
                dfs_recursive(neighbor)

    dfs_recursive(start_vertex)
    return dfs_order

def breadth_first_search(graph, start_vertex):
    if start_vertex not in graph.adjacency_list:
        raise ValueError(f"Start vertex '{start_vertex}' not in graph")

    visited = {start_vertex}
    bfs_order = [start_vertex]
    queue = deque([start_vertex])

    while queue:
        vertex = queue.popleft()
        for neighbor in graph.get_neighbors(vertex):
            if neighbor not in visited:
                visited.add(neighbor)
                bfs_order.append(neighbor)
                queue.append(neighbor)
                
    return bfs_order

def find_connected_components(graph):
    visited = set()
    components = []
    all_vertices = graph.get_vertices()

    for vertex in all_vertices:
        if vertex not in visited:
            component = []
            queue = deque([vertex])
            current_component_visited = {vertex}
            
            while queue:
                v = queue.popleft()
                component.append(v)
                visited.add(v) 
                for neighbor in graph.get_neighbors(v):
                    if neighbor not in current_component_visited:
                         current_component_visited.add(neighbor)
                         queue.append(neighbor)
                if not graph.directed:
                     for other_vertex in all_vertices:
                         if other_vertex not in current_component_visited and v in graph.get_neighbors(other_vertex):
                             current_component_visited.add(other_vertex)
                             queue.append(other_vertex)
                             
            if component: 
                components.append(sorted(component)) 
                
    return components

def has_cycle(graph):
    visited = set() 
    recursion_stack = set() 
    all_vertices = graph.get_vertices()

    for vertex in all_vertices:
        if vertex not in visited:
            if _has_cycle_util(graph, vertex, visited, recursion_stack):
                return True
    return False

def _has_cycle_util(graph, vertex, visited, recursion_stack):
    visited.add(vertex)
    recursion_stack.add(vertex)

    for neighbor in graph.get_neighbors(vertex):
        if neighbor not in visited:
            if _has_cycle_util(graph, neighbor, visited, recursion_stack):
                return True
        elif neighbor in recursion_stack:
            return True

    recursion_stack.remove(vertex) 
    return False

def has_cycle_undirected(graph):
    if graph.directed:
        raise TypeError("Use has_cycle for directed graphs")
        
    visited = set()
    all_vertices = graph.get_vertices()

    for vertex in all_vertices:
        if vertex not in visited:
            if _has_cycle_undirected_util(graph, vertex, visited, parent=None):
                return True
    return False

def _has_cycle_undirected_util(graph, vertex, visited, parent):
    visited.add(vertex)

    for neighbor in graph.get_neighbors(vertex):
        if neighbor not in visited:
            if _has_cycle_undirected_util(graph, neighbor, visited, vertex):
                return True
        elif neighbor != parent:
            return True
    return False


def kruskal_mst(graph):
    if graph.directed:
        raise TypeError("Kruskal's algorithm applies to undirected graphs")

    mst_edges = []
    total_weight = 0
    edges = graph.get_edges()
    
    weighted_edges = []
    for edge in edges:
        if len(edge) == 3: 
            weight, start, end = edge[2], edge[0], edge[1]
            weighted_edges.append((weight, start, end))
        else:
            pass 
            
    weighted_edges.sort() 
    
    dsu = DSU(graph.get_vertices())
    
    for weight, start, end in weighted_edges:
        if dsu.union(start, end):
            mst_edges.append((start, end, weight))
            total_weight += weight
            
            if len(mst_edges) == len(graph.get_vertices()) - 1:
                break
                
    num_vertices = len(graph.get_vertices())
    if num_vertices > 0 and len(mst_edges) < num_vertices - 1:
        print("Warning: Graph may not be connected, MST includes edges for one component.")

    return mst_edges, total_weight

def dijkstra(graph, start_node):
    if start_node not in graph.get_vertices():
        raise ValueError(f"Start node '{start_node}' not found in graph.")

    distances = {node: float('inf') for node in graph.get_vertices()}
    distances[start_node] = 0
    priority_queue = [(0, start_node)]  

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_distance > distances[current_node]:
            continue

        for neighbor in graph.get_neighbors(current_node):
            weight = graph.get_edge_weight(current_node, neighbor)
            if weight is None:
                weight = 1
            if not isinstance(weight, (int, float)):
                 raise TypeError(f"Edge ({current_node}, {neighbor}) has non-numeric weight '{weight}'.")

            if weight < 0:
                raise ValueError("Dijkstra's algorithm does not support negative edge weights.")

            distance = current_distance + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(priority_queue, (distance, neighbor))

    reachable_distances = {node: dist for node, dist in distances.items() if dist != float('inf')}
    return reachable_distances

if __name__ == '__main__':
    g = Graph()
    verts = ['A', 'B', 'C', 'D', 'E', 'F']
    for v in verts: g.add_vertex(v)
    g.add_edge('A', 'B', 4)
    g.add_edge('A', 'C', 2)
    g.add_edge('B', 'C', 5)
    g.add_edge('B', 'D', 10)
    g.add_edge('C', 'E', 3)
    g.add_edge('E', 'D', 4)
    g.add_edge('D', 'F', 11)
    g.add_vertex('G')
    g.add_vertex('H')
    g.add_edge('G', 'H', 1)

    print("--- Graph Algorithms Example ---")
    print(g)

    try:
        print(f"DFS from A: {depth_first_search(g, 'A')}")
    except ValueError as e:
        print(e)

    try:
        print(f"BFS from A: {breadth_first_search(g, 'A')}")
    except ValueError as e:
        print(e)

    print(f"Connected Components: {find_connected_components(g)}")

    print(f"Has Cycle (Undirected)? {has_cycle_undirected(g)}") 
    g_cycle = Graph()
    g_cycle.add_vertex(1); g_cycle.add_vertex(2); g_cycle.add_vertex(3)
    g_cycle.add_edge(1, 2); g_cycle.add_edge(2, 3); g_cycle.add_edge(3, 1)
    print(f"Graph 1-2-3-1 Has Cycle? {has_cycle_undirected(g_cycle)}")
    g_no_cycle = Graph()
    g_no_cycle.add_vertex(1); g_no_cycle.add_vertex(2); g_no_cycle.add_vertex(3)
    g_no_cycle.add_edge(1, 2); g_no_cycle.add_edge(2, 3);
    print(f"Graph 1-2-3 Has Cycle? {has_cycle_undirected(g_no_cycle)}")

    try:
        mst, weight = kruskal_mst(g)
        print(f"\nKruskal MST Edges: {mst}")
        print(f"Kruskal MST Total Weight: {weight}")
    except TypeError as e:
        print(e)
        
    g_dir_cycle = Graph(directed=True)
    g_dir_cycle.add_vertex(1); g_dir_cycle.add_vertex(2); g_dir_cycle.add_vertex(3)
    g_dir_cycle.add_edge(1, 2); g_dir_cycle.add_edge(2, 3); g_dir_cycle.add_edge(3, 1)
    print(f"\nDirected Graph 1->2->3->1 Has Cycle? {has_cycle(g_dir_cycle)}")
    
    g_dir_dag = Graph(directed=True)
    g_dir_dag.add_vertex(1); g_dir_dag.add_vertex(2); g_dir_dag.add_vertex(3)
    g_dir_dag.add_edge(1, 2); g_dir_dag.add_edge(1, 3); g_dir_dag.add_edge(2, 3)
    print(f"Directed Graph 1->2, 1->3, 2->3 Has Cycle? {has_cycle(g_dir_dag)}")

    try:
        print(f"\nDijkstra's shortest paths from A: {dijkstra(g, 'A')}")
    except ValueError as e:
        print(e)
    except TypeError as e:
        print(e)

    try:
        print(f"Dijkstra's shortest paths from X: {dijkstra(g, 'X')}")
    except ValueError as e:
        print(e)

    g_neg = Graph()
    g_neg.add_vertex('A')
    g_neg.add_vertex('B')
    g_neg.add_edge('A', 'B', -5)
    try:
        print(f"Dijkstra's with negative weight: {dijkstra(g_neg, 'A')}")
    except ValueError as e:
        print(e)

    g_non_numeric = Graph()
    g_non_numeric.add_vertex('A')
    g_non_numeric.add_vertex('B')
    g_non_numeric.add_edge('A', 'B', 'heavy')
    try:
        print(f"Dijkstra's with non-numeric weight: {dijkstra(g_non_numeric, 'A')}")
    except TypeError as e:
        print(e)
    try:
        print(f"DFS from A: {depth_first_search(g, 'A')}")
    except ValueError as e:
        print(e)

    try:
        print(f"BFS from A: {breadth_first_search(g, 'A')}")
    except ValueError as e:
        print(e)

    print(f"Connected Components: {find_connected_components(g)}")

    print(f"Has Cycle (Undirected)? {has_cycle_undirected(g)}") 
    g_cycle = Graph()
    g_cycle.add_vertex(1); g_cycle.add_vertex(2); g_cycle.add_vertex(3)
    g_cycle.add_edge(1, 2); g_cycle.add_edge(2, 3); g_cycle.add_edge(3, 1)
    print(f"Graph 1-2-3-1 Has Cycle? {has_cycle_undirected(g_cycle)}")
    g_no_cycle = Graph()
    g_no_cycle.add_vertex(1); g_no_cycle.add_vertex(2); g_no_cycle.add_vertex(3)
    g_no_cycle.add_edge(1, 2); g_no_cycle.add_edge(2, 3);
    print(f"Graph 1-2-3 Has Cycle? {has_cycle_undirected(g_no_cycle)}")

    try:
        mst, weight = kruskal_mst(g)
        print(f"\nKruskal MST Edges: {mst}")
        print(f"Kruskal MST Total Weight: {weight}")
    except TypeError as e:
        print(e)
        
    g_dir_cycle = Graph(directed=True)
    g_dir_cycle.add_vertex(1); g_dir_cycle.add_vertex(2); g_dir_cycle.add_vertex(3)
    g_dir_cycle.add_edge(1, 2); g_dir_cycle.add_edge(2, 3); g_dir_cycle.add_edge(3, 1)
    print(f"\nDirected Graph 1->2->3->1 Has Cycle? {has_cycle(g_dir_cycle)}")
    
    g_dir_dag = Graph(directed=True)
    g_dir_dag.add_vertex(1); g_dir_dag.add_vertex(2); g_dir_dag.add_vertex(3)
    g_dir_dag.add_edge(1, 2); g_dir_dag.add_edge(1, 3); g_dir_dag.add_edge(2, 3)
    print(f"Directed Graph 1->2, 1->3, 2->3 Has Cycle? {has_cycle(g_dir_dag)}")

    try:
        print(f"\nDijkstra's shortest paths from A: {dijkstra(g, 'A')}")
    except ValueError as e:
        print(e)
    except TypeError as e:
        print(e)

    try:
        print(f"Dijkstra's shortest paths from X: {dijkstra(g, 'X')}")
    except ValueError as e:
        print(e)

    g_neg = Graph()
    g_neg.add_vertex('A')
    g_neg.add_vertex('B')
    g_neg.add_edge('A', 'B', -5)
    try:
        print(f"Dijkstra's with negative weight: {dijkstra(g_neg, 'A')}")
    except ValueError as e:
        print(e)

    g_non_numeric = Graph()
    g_non_numeric.add_vertex('A')
    g_non_numeric.add_vertex('B')
    g_non_numeric.add_edge('A', 'B', 'heavy')
    try:
        print(f"Dijkstra's with non-numeric weight: {dijkstra(g_non_numeric, 'A')}")
    except TypeError as e:
        print(e)
    # Test with non-numeric weight (should raise error)
    g_non_numeric = Graph()
    g_non_numeric.add_vertex('A')
    g_non_numeric.add_vertex('B')
    g_non_numeric.add_edge('A', 'B', 'heavy')
    try:
        print(f"Dijkstra's with non-numeric weight: {dijkstra(g_non_numeric, 'A')}")
    except TypeError as e:
        print(e)
