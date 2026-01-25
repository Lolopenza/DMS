class Graph:
    def __init__(self, directed=False):
        self.adjacency_list = {} 
        self.directed = directed

    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = {} 

    def add_edge(self, start, end, weight=None):
        self.add_vertex(start)
        self.add_vertex(end)

        self.adjacency_list[start][end] = weight

        if not self.directed:
            self.adjacency_list[end][start] = weight

    def get_vertices(self):
        return list(self.adjacency_list.keys())
        
    def get_edges(self):
        edges = set() 
        for vertex, neighbors in self.adjacency_list.items():
            for neighbor, weight in neighbors.items():
                if not self.directed and vertex > neighbor:
                    continue
                edge = (vertex, neighbor, weight) if weight is not None else (vertex, neighbor)
                edges.add(edge)
        return list(edges)
        
    def get_neighbors(self, vertex):
        if vertex not in self.adjacency_list:
            raise ValueError(f"Vertex '{vertex}' not in graph")
        return list(self.adjacency_list[vertex].keys())
        
    def get_degree(self, vertex):
        if vertex not in self.adjacency_list:
            raise ValueError(f"Vertex '{vertex}' not in graph")
            
        if self.directed:
            in_degree = 0
            for _, neighbors in self.adjacency_list.items():
                if vertex in neighbors:
                    in_degree += 1
            out_degree = len(self.adjacency_list[vertex])
            return in_degree + out_degree 
        else:
            degree = len(self.adjacency_list[vertex])
            if vertex in self.adjacency_list[vertex]: 
                 degree += 1
            return degree

    def get_edge_weight(self, start, end):
        if start not in self.adjacency_list or end not in self.adjacency_list[start]:
            if not self.directed and end in self.adjacency_list and start in self.adjacency_list[end]:
                 return self.adjacency_list[end].get(start)
            return None 
        return self.adjacency_list[start].get(end)

    def __str__(self):
        res = f"Graph ({'Directed' if self.directed else 'Undirected'}):\n"
        res += f" Vertices: {self.get_vertices()}\n"
        res += f" Edges: {self.get_edges()}\n"
        return res

if __name__ == '__main__':
    g_undir = Graph()
    g_undir.add_vertex("A")
    g_undir.add_vertex("B")
    g_undir.add_vertex("C")
    g_undir.add_vertex("D")
    g_undir.add_edge("A", "B", weight=5)
    g_undir.add_edge("A", "C")
    g_undir.add_edge("B", "C", weight=2)
    g_undir.add_edge("C", "D")
    g_undir.add_edge("A", "A", weight=1) 

    print("--- Undirected Graph ---")
    print(g_undir)
    print(f"Vertices: {g_undir.get_vertices()}")
    print(f"Edges: {g_undir.get_edges()}")
    print(f"Neighbors of A: {g_undir.get_neighbors('A')}")
    print(f"Degree of A: {g_undir.get_degree('A')}") 
    print(f"Degree of C: {g_undir.get_degree('C')}") 
    print(f"Weight A-B: {g_undir.get_edge_weight('A', 'B')}")
    print(f"Weight B-A: {g_undir.get_edge_weight('B', 'A')}")
    print(f"Weight A-C: {g_undir.get_edge_weight('A', 'C')}") 
    print(f"Weight A-D: {g_undir.get_edge_weight('A', 'D')}") 

    g_dir = Graph(directed=True)
    g_dir.add_vertex(1)
    g_dir.add_vertex(2)
    g_dir.add_vertex(3)
    g_dir.add_edge(1, 2, weight=10)
    g_dir.add_edge(2, 3)
    g_dir.add_edge(3, 1)
    g_dir.add_edge(1, 1, weight=5) 

    print("\n--- Directed Graph ---")
    print(g_dir)
    print(f"Vertices: {g_dir.get_vertices()}")
    print(f"Edges: {g_dir.get_edges()}")
    print(f"Neighbors of 1 (Out): {g_dir.get_neighbors(1)}")
    print(f"Degree of 1 (In+Out): {g_dir.get_degree(1)}") 
    print(f"Degree of 2 (In+Out): {g_dir.get_degree(2)}") 
    print(f"Weight 1->2: {g_dir.get_edge_weight(1, 2)}")
    print(f"Weight 2->1: {g_dir.get_edge_weight(2, 1)}")
    print("--- Undirected Graph ---")
    print(g_undir)
    print(f"Vertices: {g_undir.get_vertices()}")
    print(f"Edges: {g_undir.get_edges()}")
    print(f"Neighbors of A: {g_undir.get_neighbors('A')}")
    print(f"Degree of A: {g_undir.get_degree('A')}") 
    print(f"Degree of C: {g_undir.get_degree('C')}") 
    print(f"Weight A-B: {g_undir.get_edge_weight('A', 'B')}")
    print(f"Weight B-A: {g_undir.get_edge_weight('B', 'A')}")
    print(f"Weight A-C: {g_undir.get_edge_weight('A', 'C')}") 
    print(f"Weight A-D: {g_undir.get_edge_weight('A', 'D')}") 

    g_dir = Graph(directed=True)
    g_dir.add_vertex(1)
    g_dir.add_vertex(2)
    g_dir.add_vertex(3)
    g_dir.add_edge(1, 2, weight=10)
    g_dir.add_edge(2, 3)
    g_dir.add_edge(3, 1)
    g_dir.add_edge(1, 1, weight=5) 

    print("\n--- Directed Graph ---")
    print(g_dir)
    print(f"Vertices: {g_dir.get_vertices()}")
    print(f"Edges: {g_dir.get_edges()}")
    print(f"Neighbors of 1 (Out): {g_dir.get_neighbors(1)}")
    print(f"Degree of 1 (In+Out): {g_dir.get_degree(1)}") 
    print(f"Degree of 2 (In+Out): {g_dir.get_degree(2)}") 
    print(f"Weight 1->2: {g_dir.get_edge_weight(1, 2)}")
    print(f"Weight 2->1: {g_dir.get_edge_weight(2, 1)}")
    print(f"Weight 2->1: {g_dir.get_edge_weight(2, 1)}") # Expect None
