document.addEventListener('DOMContentLoaded', function() {
    setupGraphAnalyzer();
    setupAlgorithmExecutor();
    setupSpecialGraphGenerators();
});

function setupGraphAnalyzer() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (!analyzeBtn) return;
    analyzeBtn.addEventListener('click', async function() {
        try {
            const graphType = document.getElementById('graphType').value;
            const verticesInput = document.getElementById('vertices').value;
            const vertices = verticesInput.split(',').map(v => v.trim()).filter(v => v);
            if (vertices.length === 0) {
                DMC.showError("Please enter at least one vertex");
                return;
            }
            const edgesInput = document.getElementById('edges').value;
            const edgeLines = edgesInput.split('\n').filter(line => line.trim());
            const edges = [];
            for (const line of edgeLines) {
                const parts = line.split(',').map(part => part.trim());
                if (parts.length < 2 || parts.length > 3) {
                    DMC.showError(`Invalid edge format: ${line}`);
                    return;
                }
                const start = parts[0];
                const end = parts[1];
                const weight = parts.length === 3 ? parseInt(parts[2]) : 1;
                if (!vertices.includes(start) || !vertices.includes(end)) {
                    DMC.showError(`Edge references non-existent vertex: ${line}`);
                    return;
                }
                edges.push([start, end, weight]);
            }
            const payload = {
                operation: 'analyze',
                graph: {
                    vertices,
                    edges,
                    directed: graphType === 'directed'
                }
            };
            const response = await fetch('/api/graph_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            displayGraphAnalysisResults(data.result);
            DMC.showSuccess("Graph analysis complete");
            let formula = `Analyze graph with ${vertices.length} vertices and ${edges.length} edges`;
            recordGraphTheoryHistory('analyze', { graphType, verticesInput, edgesInput }, data.result, formula);
        } catch (error) {
            DMC.showError("Error analyzing graph: " + error.message);
        }
    });
}

function setupAlgorithmExecutor() {
    const executeBtn = document.getElementById('executeBtn');
    const clearBtn = document.getElementById('clearBtn');
    if (!executeBtn || !clearBtn) return;
    document.getElementById('algorithm').addEventListener('change', function() {
        const algorithm = this.value;
        document.getElementById('endVertexGroup').style.display = 
            algorithm === 'shortest_path' ? 'block' : 'none';
    });
    executeBtn.addEventListener('click', async function() {
        try {
            const graphType = document.getElementById('graphType').value;
            const verticesInput = document.getElementById('vertices').value;
            const vertices = verticesInput.split(',').map(v => v.trim()).filter(v => v);
            const edgesInput = document.getElementById('edges').value;
            const edgeLines = edgesInput.split('\n').filter(line => line.trim());
            const edges = [];
            for (const line of edgeLines) {
                const parts = line.split(',').map(part => part.trim());
                if (parts.length < 2) continue;
                const start = parts[0];
                const end = parts[1];
                const weight = parts.length === 3 ? parseInt(parts[2]) : 1;
                edges.push([start, end, weight]);
            }
            const algorithm = document.getElementById('algorithm').value;
            const startVertex = document.getElementById('startVertex').value.trim();
            const endVertex = document.getElementById('endVertex').value.trim();
            if (!startVertex) {
                DMC.showError('Start node is required.');
                return;
            }
            if (algorithm === 'shortest_path' && !endVertex) {
                DMC.showError('End node is required for shortest path.');
                return;
            }
            if (!vertices.includes(startVertex)) {
                DMC.showError(`Start vertex "${startVertex}" not found in graph`);
                return;
            }
            if (algorithm === 'shortest_path' && !vertices.includes(endVertex)) {
                DMC.showError(`End vertex "${endVertex}" not found in graph`);
                return;
            }
            let op = '';
            if (algorithm === 'bfs') op = 'bfs';
            else if (algorithm === 'dfs') op = 'dfs';
            else if (algorithm === 'connected_components') op = 'connected_components';
            else if (algorithm === 'cycle_detection') op = 'has_cycle';
            else if (algorithm === 'mst') op = 'mst';
            else if (algorithm === 'shortest_path') op = 'dijkstra';
            const payload = {
                operation: op,
                graph: {
                    vertices,
                    edges,
                    directed: graphType === 'directed'
                },
                start: startVertex,
                end: endVertex
            };
            const response = await fetch('/api/graph_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server error');
            displayAlgorithmResults(algorithm, data.result, vertices, edges, graphType === 'directed');
            DMC.showSuccess(`${algorithm.replace(/_/g, ' ')} algorithm executed successfully`);
            let formula = `${algorithm.replace(/_/g, ' ')} from ${startVertex}: ${data.result.path.join(' → ')}`;
            recordGraphTheoryHistory(op, { graphType, verticesInput, edgesInput, startVertex, endVertex }, data.result, formula);
        } catch (error) {
            DMC.showError("Error executing algorithm: " + error.message);
        }
    });
    clearBtn.addEventListener('click', function() {
        document.getElementById('algorithmResult').style.display = 'none';
        DMC.showSuccess("Results cleared");
    });
}

function setupSpecialGraphGenerators() {
    const generateBtns = document.querySelectorAll('.generate-btn');
    if (generateBtns.length === 0) return;

    generateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const graphType = this.getAttribute('data-graph');
            const size = parseInt(this.getAttribute('data-size'));
            
            let vertices, edges;
            
            if (graphType === 'complete') {
                ({ vertices, edges } = generateCompleteGraph(size));
            } else if (graphType === 'cycle') {
                ({ vertices, edges } = generateCycleGraph(size));
            } else if (graphType === 'star') {
                ({ vertices, edges } = generateStarGraph(size));
            } else if (graphType === 'path') {
                ({ vertices, edges } = generatePathGraph(size));
            } else {
                DMC.showError(`Unknown graph type: ${graphType}`);
                return;
            }
            
            document.getElementById('vertices').value = vertices.join(',');
            document.getElementById('edges').value = edges.map(e => 
                `${e.source},${e.target}${e.weight !== 1 ? ',' + e.weight : ''}`
            ).join('\n');
            
            document.getElementById('graphType').value = 'undirected';
            
            document.getElementById('analyzeBtn').click();
            
            DMC.showSuccess(`Generated ${graphType} graph with ${size} vertices`);
        });
    });
}

function constructGraph(vertices, edges, isDirected) {
    const graph = {
        vertices: vertices,
        edges: edges,
        isDirected: isDirected,
        adjacencyList: {}
    };
    
    for (const vertex of vertices) {
        graph.adjacencyList[vertex] = [];
    }
    
    for (const edge of edges) {
        graph.adjacencyList[edge.source].push({ vertex: edge.target, weight: edge.weight });
        
        if (!isDirected) {
            graph.adjacencyList[edge.target].push({ vertex: edge.source, weight: edge.weight });
        }
    }
    
    return graph;
}

function analyzeGraph(graph) {
    const vertexCount = graph.vertices.length;
    let edgeCount = graph.edges.length;
    
    const isComplete = !graph.isDirected && edgeCount === (vertexCount * (vertexCount - 1)) / 2;
    
    const hasCycle = detectCycle(graph);
    
    let connectedComponents = [];
    if (!graph.isDirected) {
        connectedComponents = findConnectedComponents(graph);
    }
    
    const isBipartite = checkBipartite(graph);
    
    const degrees = {};
    for (const vertex of graph.vertices) {
        degrees[vertex] = graph.adjacencyList[vertex].length;
    }
    
    return {
        vertexCount,
        edgeCount,
        isDirected: graph.isDirected,
        isComplete,
        hasCycle,
        connectedComponents,
        isBipartite,
        degrees
    };
}

function detectCycle(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    
    function dfsForCycle(vertex, parent = null) {
        visited.add(vertex);
        recursionStack.add(vertex);
        
        for (const neighbor of graph.adjacencyList[vertex]) {
            const nextVertex = neighbor.vertex;
            
            if (!graph.isDirected && nextVertex === parent) {
                continue;
            }
            
            if (!visited.has(nextVertex)) {
                if (dfsForCycle(nextVertex, vertex)) {
                    return true;
                }
            } else if (recursionStack.has(nextVertex)) {
                return true;
            }
        }
        
        recursionStack.delete(vertex);
        return false;
    }
    
    for (const vertex of graph.vertices) {
        if (!visited.has(vertex)) {
            if (dfsForCycle(vertex)) {
                return true;
            }
        }
    }
    
    return false;
}

function findConnectedComponents(graph) {
    const visited = new Set();
    const components = [];
    
    for (const vertex of graph.vertices) {
        if (!visited.has(vertex)) {
            const component = [];
            dfs(vertex, component);
            components.push(component);
        }
    }
    
    function dfs(vertex, component) {
        visited.add(vertex);
        component.push(vertex);
        
        for (const neighbor of graph.adjacencyList[vertex]) {
            const nextVertex = neighbor.vertex;
            if (!visited.has(nextVertex)) {
                dfs(nextVertex, component);
            }
        }
    }
    
    return components;
}

function checkBipartite(graph) {
    const colors = {};
    
    for (const vertex of graph.vertices) {
        if (!(vertex in colors)) {
            if (!colorBFS(vertex)) {
                return false;
            }
        }
    }
    
    function colorBFS(startVertex) {
        const queue = [startVertex];
        colors[startVertex] = 0;
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentColor = colors[current];
            
            for (const neighbor of graph.adjacencyList[current]) {
                const nextVertex = neighbor.vertex;
                
                if (!(nextVertex in colors)) {
                    colors[nextVertex] = 1 - currentColor;
                    queue.push(nextVertex);
                } else if (colors[nextVertex] === currentColor) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    return true;
}

function executeGraphAlgorithm(graph, algorithm, startVertex, endVertex) {
    switch (algorithm) {
        case 'dfs':
            return depthFirstSearch(graph, startVertex);
        case 'bfs':
            return breadthFirstSearch(graph, startVertex);
        case 'connected_components':
            return findConnectedComponents(graph);
        case 'has_cycle':
            return { hasCycle: detectCycle(graph) };
        case 'mst':
            return kruskalMST(graph);
        case 'shortest_path':
            return dijkstraShortestPath(graph, startVertex, endVertex);
        default:
            throw new Error(`Unknown algorithm: ${algorithm}`);
    }
}

function depthFirstSearch(graph, startVertex) {
    const visited = new Set();
    const result = [];
    
    function dfs(vertex) {
        visited.add(vertex);
        result.push(vertex);
        
        for (const neighbor of graph.adjacencyList[vertex]) {
            const nextVertex = neighbor.vertex;
            if (!visited.has(nextVertex)) {
                dfs(nextVertex);
            }
        }
    }
    
    dfs(startVertex);
    return { path: result, visited: Array.from(visited) };
}

function breadthFirstSearch(graph, startVertex) {
    const visited = new Set([startVertex]);
    const result = [startVertex];
    const queue = [startVertex];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        for (const neighbor of graph.adjacencyList[current]) {
            const nextVertex = neighbor.vertex;
            if (!visited.has(nextVertex)) {
                visited.add(nextVertex);
                result.push(nextVertex);
                queue.push(nextVertex);
            }
        }
    }
    
    return { path: result, visited: Array.from(visited) };
}

function kruskalMST(graph) {
    if (graph.isDirected) {
        throw new Error("MST algorithms require an undirected graph");
    }
    
    const allEdges = [];
    for (const edge of graph.edges) {
        allEdges.push({
            source: edge.source,
            target: edge.target,
            weight: edge.weight
        });
    }
    
    allEdges.sort((a, b) => a.weight - b.weight);
    
    const parent = {};
    for (const vertex of graph.vertices) {
        parent[vertex] = vertex;
    }
    
    function find(x) {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }
    
    function union(x, y) {
        parent[find(x)] = find(y);
    }
    
    const mstEdges = [];
    let mstWeight = 0;
    
    for (const edge of allEdges) {
        const { source, target, weight } = edge;
        
        if (find(source) !== find(target)) {
            union(source, target);
            mstEdges.push(edge);
            mstWeight += weight;
            
            if (mstEdges.length === graph.vertices.length - 1) {
                break;
            }
        }
    }
    
    return { mstEdges, mstWeight };
}

function dijkstraShortestPath(graph, startVertex, endVertex) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(graph.vertices);
    
    for (const vertex of graph.vertices) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
    }
    
    distances[startVertex] = 0;
    
    while (unvisited.size > 0) {
        let current = null;
        let minDistance = Infinity;
        
        for (const vertex of unvisited) {
            if (distances[vertex] < minDistance) {
                current = vertex;
                minDistance = distances[vertex];
            }
        }
        
        if (current === null || distances[current] === Infinity) {
            break;
        }
        
        if (current === endVertex) {
            break;
        }
        
        unvisited.delete(current);
        
        for (const neighbor of graph.adjacencyList[current]) {
            const { vertex: nextVertex, weight } = neighbor;
            
            if (unvisited.has(nextVertex)) {
                const tentativeDistance = distances[current] + weight;
                
                if (tentativeDistance < distances[nextVertex]) {
                    distances[nextVertex] = tentativeDistance;
                    previous[nextVertex] = current;
                }
            }
        }
    }
    
    const path = [];
    let current = endVertex;
    
    if (distances[endVertex] === Infinity) {
        return { path: [], distance: Infinity };
    }
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    return { path, distance: distances[endVertex] };
}

function generateCompleteGraph(n) {
    const vertices = [];
    const edges = [];
    
    for (let i = 0; i < n; i++) {
        vertices.push(String.fromCharCode(65 + i));
    }
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({
                source: vertices[i],
                target: vertices[j],
                weight: 1
            });
        }
    }
    
    return { vertices, edges };
}

function generateCycleGraph(n) {
    const vertices = [];
    const edges = [];
    
    for (let i = 0; i < n; i++) {
        vertices.push(String.fromCharCode(65 + i));
    }
    
    for (let i = 0; i < n; i++) {
        edges.push({
            source: vertices[i],
            target: vertices[(i + 1) % n],
            weight: 1
        });
    }
    
    return { vertices, edges };
}

function generateStarGraph(n) {
    const vertices = [];
    const edges = [];
    
    for (let i = 0; i < n; i++) {
        vertices.push(String.fromCharCode(65 + i));
    }
    
    for (let i = 1; i < n; i++) {
        edges.push({
            source: vertices[0],
            target: vertices[i],
            weight: 1
        });
    }
    
    return { vertices, edges };
}

function generatePathGraph(n) {
    const vertices = [];
    const edges = [];
    
    for (let i = 0; i < n; i++) {
        vertices.push(String.fromCharCode(65 + i));
    }
    
    for (let i = 0; i < n - 1; i++) {
        edges.push({
            source: vertices[i],
            target: vertices[i + 1],
            weight: 1
        });
    }
    
    return { vertices, edges };
}

function displayGraphAnalysisResults(results) {
    const resultValue = document.getElementById('resultValue');
    if (!resultValue) return;
    
    let html = `
        <div class="graph-properties">
            <div class="property">
                <div class="property-name">Type:</div>
                <div class="property-value">${results.isDirected ? 'Directed' : 'Undirected'} Graph</div>
            </div>
            <div class="property">
                <div class="property-name">Vertices:</div>
                <div class="property-value">${results.vertexCount}</div>
            </div>
            <div class="property">
                <div class="property-name">Edges:</div>
                <div class="property-value">${results.edgeCount}</div>
            </div>
            <div class="property">
                <div class="property-name">Complete:</div>
                <div class="property-value">${results.isComplete ? 'Yes' : 'No'}</div>
            </div>
            <div class="property">
                <div class="property-name">Contains Cycle:</div>
                <div class="property-value">${results.hasCycle ? 'Yes' : 'No'}</div>
            </div>
            <div class="property">
                <div class="property-name">Bipartite:</div>
                <div class="property-value">${results.isBipartite ? 'Yes' : 'No'}</div>
            </div>
    `;
    
    if (!results.isDirected) {
        html += `
            <div class="property">
                <div class="property-name">Connected Components:</div>
                <div class="property-value">${results.connectedComponents.length}</div>
            </div>
        `;
        
        if (results.connectedComponents.length > 0) {
            html += `<div class="components-list"><ul>`;
            results.connectedComponents.forEach((component, index) => {
                html += `<li>Component ${index + 1}: {${component.join(', ')}}</li>`;
            });
            html += `</ul></div>`;
        }
    }
    
    html += `
        <div class="property">
            <div class="property-name">Vertex Degrees:</div>
            <div class="property-value">
                <ul class="degree-list">
    `;
    
    for (const vertex in results.degrees) {
        html += `<li>${vertex}: ${results.degrees[vertex]}</li>`;
    }
    
    html += `
                </ul>
            </div>
        </div>
    `;
    
    html += `</div>`;
    
    resultValue.innerHTML = html;
}

function displayAlgorithmResults(algorithm, result, vertices, edges, isDirected) {
    const resultValue = document.getElementById('algorithmResultValue');
    if (!resultValue) return;
    
    let html = '';
    
    switch (algorithm) {
        case 'dfs':
        case 'bfs':
            html = `
                <h4>${algorithm === 'dfs' ? 'Depth-First Search' : 'Breadth-First Search'} Result</h4>
                <div class="algorithm-result">
                    <div class="result-property">
                        <div class="property-name">Path:</div>
                        <div class="property-value">${result.path.join(' → ')}</div>
                    </div>
                    <div class="result-property">
                        <div class="property-name">Visited Vertices:</div>
                        <div class="property-value">${result.visited.length} of ${vertices.length}</div>
                    </div>
                    <div class="vertex-set">
                        ${vertices.map(v => `
                            <div class="vertex ${result.visited.includes(v) ? 'visited' : ''}">
                                ${v}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
            
        case 'connected_components':
            html = `
                <h4>Connected Components</h4>
                <div class="algorithm-result">
                    <div class="result-property">
                        <div class="property-name">Number of Components:</div>
                        <div class="property-value">${result.length}</div>
                    </div>
                    <div class="components-list">
            `;
            
            result.forEach((component, index) => {
                html += `
                    <div class="component">
                        <div class="component-header">Component ${index + 1}:</div>
                        <div class="component-vertices">${component.join(', ')}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            break;
            
        case 'has_cycle':
            html = `
                <h4>Cycle Detection</h4>
                <div class="algorithm-result">
                    <div class="result-property">
                        <div class="property-name">Contains Cycle:</div>
                        <div class="property-value">${result.hasCycle ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            `;
            break;
            
        case 'mst':
            html = `
                <h4>Minimum Spanning Tree (Kruskal's Algorithm)</h4>
                <div class="algorithm-result">
                    <div class="result-property">
                        <div class="property-name">Total Weight:</div>
                        <div class="property-value">${result.mstWeight}</div>
                    </div>
                    <div class="result-property">
                        <div class="property-name">MST Edges:</div>
                        <div class="property-value">
                            <ul class="edge-list">
            `;
            
            result.mstEdges.forEach(edge => {
                html += `<li>${edge.source} - ${edge.target} (${edge.weight})</li>`;
            });
            
            html += `
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'shortest_path':
            html = `
                <h4>Shortest Path (Dijkstra's Algorithm)</h4>
                <div class="algorithm-result">
            `;
            
            if (result.path.length === 0 || result.distance === Infinity) {
                html += `
                    <div class="result-property">
                        <div class="property-name">Result:</div>
                        <div class="property-value">No path exists between the selected vertices</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="result-property">
                        <div class="property-name">Shortest Distance:</div>
                        <div class="property-value">${result.distance}</div>
                    </div>
                    <div class="result-property">
                        <div class="property-name">Path:</div>
                        <div class="property-value">${result.path.join(' → ')}</div>
                    </div>
                `;
            }
            
            html += `
                </div>
            `;
            break;
    }
    
    resultValue.innerHTML = html;
    
    visualizeAlgorithmResult(algorithm, result, vertices, edges, isDirected);
}

function visualizeGraph(vertices, edges, isDirected) {
    const container = document.getElementById('graphVisualization');
    if (!container) return;
    
    container.innerHTML = `
        <div class="simple-graph-viz">
            <h4>Graph Visualization</h4>
            <p>This is a simplified visualization. For a better experience, consider upgrading to a more sophisticated visualization library.</p>
            <div class="vertex-list">
                <strong>Vertices:</strong> ${vertices.join(', ')}
            </div>
            <div class="edge-list">
                <strong>Edges:</strong>
                <ul>
                    ${edges.map(e => `<li>${e.source} ${isDirected ? '→' : '—'} ${e.target}${e.weight !== 1 ? ` (${e.weight})` : ''}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function visualizeAlgorithmResult(algorithm, result, vertices, edges, isDirected) {
    const container = document.getElementById('algorithmVisualization');
    if (!container) return;
    
    container.innerHTML = `
        <div class="algorithm-viz">
            <p>Algorithm visualization would be displayed here.</p>
            <p>For a better experience, consider integrating a graph visualization library.</p>
        </div>
    `;
}

function recordGraphTheoryHistory(operation, inputs, answer, formula) {
    window.DMC_ExplainHistory = window.DMC_ExplainHistory || [];
    window.DMC_ExplainHistory.push({
        topic: 'graph theory',
        operation: operation,
        inputs: inputs,
        answer: answer,
        formula: formula,
        timestamp: Date.now()
    });
    if (window.DMC_ExplainHistory.length > 10) window.DMC_ExplainHistory.shift();
    window.DMC_ExplainContext.operation = operation;
    window.DMC_ExplainContext.inputs = inputs;
    window.DMC_ExplainContext.formula = formula;
}
