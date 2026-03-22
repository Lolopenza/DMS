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

