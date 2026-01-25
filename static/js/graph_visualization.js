// This file will contain JavaScript code for graph visualizations,
// potentially using Cytoscape.js or other libraries.

// Example function to initialize a Cytoscape graph (assuming an HTML element with id 'cy')
function initGraphVisualization(graphData) {
    if (typeof cytoscape === 'undefined') {
        console.error('Cytoscape.js not loaded');
        return;
    }

    const cyContainer = document.getElementById('cy');
    if (!cyContainer) {
        console.error('Cytoscape container element #cy not found.');
        return;
    }

    const cy = cytoscape({
        container: cyContainer, // container to render in
        elements: graphData, // graph data (nodes and edges)
        style: [ // stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(id)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ],
        layout: {
            name: 'cose', // e.g., cose, grid, random, circle, concentric
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        }
    });
    console.log('Cytoscape graph initialized.');
}

// Example:
// document.addEventListener('DOMContentLoaded', () => {
//     const sampleData = {
//         nodes: [
//             { data: { id: 'a' } },
//             { data: { id: 'b' } }
//         ],
//         edges: [
//             { data: { id: 'ab', source: 'a', target: 'b' } }
//         ]
//     };
//     // You would typically fetch this data from your backend
//     // initGraphVisualization(sampleData); 
// });

class GraphVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Graph visualization container not found');
            return;
        }

        this.nodes = new vis.DataSet([]);
        this.edges = new vis.DataSet([]);
        this.network = null;
        this.animationSpeed = 5;
        this.isAnimating = false;
        this.options = {
            nodes: {
                shape: 'circle',
                size: 20,
                font: {
                    size: 14,
                    color: '#ffffff'
                },
                color: {
                    background: '#5e35b1',
                    border: '#280680',
                    highlight: {
                        background: '#9162e4',
                        border: '#280680'
                    }
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 2,
                color: {
                    color: '#666666',
                    highlight: '#ff4081'
                },
                arrows: {
                    to: { enabled: false }
                },
                smooth: {
                    type: 'continuous'
                },
                shadow: true,
                font: {
                    size: 12,
                    align: 'middle'
                }
            },
            physics: {
                stabilization: true,
                barnesHut: {
                    gravitationalConstant: -2000,
                    springConstant: 0.04,
                    springLength: 200
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                dragNodes: true,
                dragView: true,
                zoomView: true,
                keyboard: {
                    enabled: true
                }
            }
        };
        this.initialize();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateGraphInfo();
    }

    initialize() {
        const data = {
            nodes: this.nodes,
            edges: this.edges
        };
        this.network = new vis.Network(this.container, data, this.options);
        
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                if (params.event.detail === 2) {
                    this.editNodeLabel(nodeId);
                }
            }
        });

        this.network.on('select', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.highlightNode(nodeId);
            }
        });

        this.network.on('stabilizationProgress', (params) => {
        });

        this.network.on('stabilizationIterationsDone', () => {
        });
    }

    setupEventListeners() {
        const addNodeBtn = document.getElementById('addNodeBtn');
        const addEdgeBtn = document.getElementById('addEdgeBtn');
        const clearGraphBtn = document.getElementById('clearGraphBtn');
        const saveGraphBtn = document.getElementById('saveGraphBtn');
        const loadGraphBtn = document.getElementById('loadGraphBtn');
        const runAlgorithmBtn = document.getElementById('runAlgorithmBtn');
        const checkPropertiesBtn = document.getElementById('checkPropertiesBtn');
        const exportPropertiesBtn = document.getElementById('exportPropertiesBtn');
        const algorithmSpeed = document.getElementById('algorithmSpeed');
        const algorithmType = document.getElementById('algorithmType');

        if (algorithmSpeed) {
            algorithmSpeed.addEventListener('input', (e) => {
                this.animationSpeed = parseInt(e.target.value);
            });
        }

        if (algorithmType) {
            algorithmType.addEventListener('change', (e) => {
                const endNodeGroup = document.getElementById('endNodeGroup');
                if (endNodeGroup) {
                    endNodeGroup.style.display = 
                        ['shortestPath', 'minimumSpanningTree'].includes(e.target.value) ? 'block' : 'none';
                }
            });
        }

        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', () => {
                const nodeId = this.nodes.length + 1;
                const label = String.fromCharCode(64 + nodeId);
                this.addNode(nodeId, label);
                DMC.showSuccess(`Added node ${label}`);
            });
        }

        if (addEdgeBtn) {
            addEdgeBtn.addEventListener('click', () => this.promptAddEdge());
        }

        if (clearGraphBtn) {
            clearGraphBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear the graph?')) {
                    this.clear();
                    DMC.showSuccess('Graph cleared');
                }
            });
        }

        if (saveGraphBtn) {
            saveGraphBtn.addEventListener('click', () => this.saveGraph());
        }

        if (loadGraphBtn) {
            loadGraphBtn.addEventListener('click', () => this.loadGraph());
        }

        if (runAlgorithmBtn) {
            runAlgorithmBtn.addEventListener('click', () => {
                if (this.isAnimating) {
                    DMC.showError('Please wait for the current animation to complete');
                    return;
                }
                this.runSelectedAlgorithm();
            });
        }

        if (checkPropertiesBtn) {
            checkPropertiesBtn.addEventListener('click', () => {
                const properties = this.analyzeGraph();
                this.displayProperties(properties);
            });
        }

        if (exportPropertiesBtn) {
            exportPropertiesBtn.addEventListener('click', () => this.exportProperties());
        }

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isAnimating) {
                    DMC.showError('Please wait for the current animation to complete');
                    return;
                }
                const preset = btn.dataset.preset;
                this.generatePresetGraph(preset);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch(e.key.toLowerCase()) {
                case 'n':
                    if (!e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        this.addNode(this.nodes.length + 1, String.fromCharCode(64 + this.nodes.length + 1));
                    }
                    break;
                case 'e':
                    if (!e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        this.promptAddEdge();
                    }
                    break;
                case 'delete':
                    if (this.network.getSelectedNodes().length > 0) {
                        e.preventDefault();
                        this.deleteSelected();
                    }
                    break;
            }

            if (e.ctrlKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.saveGraph();
            }
        });
    }

    generatePresetGraph(type) {
        this.clear();
        const nodeCount = 5;

        switch(type) {
            case 'complete':
                this.generateCompleteGraph(nodeCount);
                break;
            case 'cycle':
                this.generateCycleGraph(nodeCount);
                break;
            case 'star':
                this.generateStarGraph(nodeCount);
                break;
            case 'path':
                this.generatePathGraph(nodeCount);
                break;
            case 'bipartite':
                this.generateBipartiteGraph(3, 2);
                break;
        }

        DMC.showSuccess(`Generated ${type} graph`);
        this.updateGraphInfo();
    }

    generateCompleteGraph(n) {
        for (let i = 1; i <= n; i++) {
            this.addNode(i, String.fromCharCode(64 + i));
        }
        for (let i = 1; i <= n; i++) {
            for (let j = i + 1; j <= n; j++) {
                this.addEdge(i, j);
            }
        }
    }

    generateCycleGraph(n) {
        for (let i = 1; i <= n; i++) {
            this.addNode(i, String.fromCharCode(64 + i));
        }
        for (let i = 1; i <= n; i++) {
            this.addEdge(i, i % n + 1);
        }
    }

    generateStarGraph(n) {
        this.addNode(1, 'A');
        for (let i = 2; i <= n; i++) {
            this.addNode(i, String.fromCharCode(64 + i));
            this.addEdge(1, i);
        }
    }

    generatePathGraph(n) {
        for (let i = 1; i <= n; i++) {
            this.addNode(i, String.fromCharCode(64 + i));
        }
        for (let i = 1; i < n; i++) {
            this.addEdge(i, i + 1);
        }
    }

    generateBipartiteGraph(n1, n2) {
        const total = n1 + n2;
        for (let i = 1; i <= total; i++) {
            this.addNode(i, String.fromCharCode(64 + i));
        }
        for (let i = 1; i <= n1; i++) {
            for (let j = n1 + 1; j <= total; j++) {
                this.addEdge(i, j);
            }
        }
    }

    saveGraph() {
        const graphData = {
            nodes: this.nodes.get(),
            edges: this.edges.get()
        };
        const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        DMC.showSuccess('Graph saved successfully');
    }

    loadGraph() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const graphData = JSON.parse(event.target.result);
                    this.clear();
                    this.nodes.add(graphData.nodes);
                    this.edges.add(graphData.edges);
                    DMC.showSuccess('Graph loaded successfully');
                    this.updateGraphInfo();
                } catch (error) {
                    DMC.showError('Invalid graph file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    exportProperties() {
        const properties = this.analyzeGraph();
        const blob = new Blob([JSON.stringify(properties, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph_properties.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        DMC.showSuccess('Properties exported successfully');
    }

    editNodeLabel(nodeId) {
        const node = this.nodes.get(nodeId);
        const newLabel = prompt('Enter new label:', node.label);
        if (newLabel) {
            this.nodes.update({ id: nodeId, label: newLabel });
            DMC.showSuccess('Node label updated');
        }
    }

    deleteSelected() {
        const selectedNodes = this.network.getSelectedNodes();
        const selectedEdges = this.network.getSelectedEdges();
        
        selectedNodes.forEach(nodeId => {
            this.nodes.remove(nodeId);
        });
        
        selectedEdges.forEach(edgeId => {
            this.edges.remove(edgeId);
        });

        this.updateGraphInfo();
        DMC.showSuccess('Selected elements deleted');
    }

    updateGraphInfo() {
        const nodeCount = document.getElementById('nodeCount');
        const edgeCount = document.getElementById('edgeCount');
        const graphDensity = document.getElementById('graphDensity');

        if (nodeCount) nodeCount.textContent = this.nodes.length;
        if (edgeCount) edgeCount.textContent = this.edges.length;
        if (graphDensity) {
            const n = this.nodes.length;
            const maxEdges = n * (n - 1) / 2;
            const density = maxEdges > 0 ? (this.edges.length / maxEdges).toFixed(2) : '0';
            graphDensity.textContent = density;
        }
    }

    addNode(id, label) {
        this.nodes.add({
            id: id,
            label: label
        });
    }

    addEdge(from, to, label = '') {
        this.edges.add({
            from: from,
            to: to,
            label: label
        });
    }

    clear() {
        this.nodes.clear();
        this.edges.clear();
    }

    visualizeBFS(startNode) {
        const visited = new Set();
        const queue = [startNode];
        visited.add(startNode);
        const delay = 1000 / this.animationSpeed;

        const animate = () => {
            if (queue.length === 0) {
                DMC.showSuccess('BFS traversal complete');
                return;
            }

            const current = queue.shift();
            this.nodes.update({ id: current, color: { background: '#ff4081' } });

            const neighbors = this.getNeighbors(current);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    this.nodes.update({ id: neighbor, color: { background: '#9162e4' } });
                }
            });

            setTimeout(animate, delay);
        };

        animate();
    }

    visualizeDFS(startNode) {
        const visited = new Set();

        const dfs = (node) => {
            visited.add(node);
            this.nodes.update({ id: node, color: { background: '#ff4081' } });

            const neighbors = this.getNeighbors(node);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    setTimeout(() => dfs(neighbor), 1000);
                }
            });
        };

        dfs(startNode);
        setTimeout(() => DMC.showSuccess('DFS traversal complete'), this.nodes.length * 1000);
    }

    visualizeShortestPath(startNode, endNode) {
        const distances = {};
        const previous = {};
        const unvisited = new Set();

        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });

        distances[startNode] = 0;

        while (unvisited.size > 0) {
            let current = null;
            let minDistance = Infinity;

            unvisited.forEach(node => {
                if (distances[node] < minDistance) {
                    current = node;
                    minDistance = distances[node];
                }
            });

            if (current === null || current === endNode) break;

            unvisited.delete(current);

            const neighbors = this.getNeighbors(current);
            neighbors.forEach(neighbor => {
                const distance = distances[current] + 1;
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previous[neighbor] = current;
                }
            });
        }

        const path = [];
        let current = endNode;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        if (path.length > 1) {
            this.highlightPath(path);
            DMC.showSuccess(`Shortest path found: ${path.map(id => String.fromCharCode(64 + id)).join(' → ')}`);
        } else {
            DMC.showError('No path found');
        }
    }

    getNeighbors(nodeId) {
        return this.edges.get()
            .filter(edge => edge.from === nodeId || edge.to === nodeId)
            .map(edge => edge.from === nodeId ? edge.to : edge.from);
    }

    highlightPath(path) {
        path.forEach((nodeId, index) => {
            setTimeout(() => {
                this.nodes.update({ id: nodeId, color: { background: '#ff4081' } });
                if (index > 0) {
                    const edge = this.edges.get().find(e => 
                        (e.from === path[index-1] && e.to === nodeId) || 
                        (e.from === nodeId && e.to === path[index-1])
                    );
                    if (edge) {
                        this.edges.update({ id: edge.id, color: { color: '#ff4081' } });
                    }
                }
            }, index * 500);
        });
    }

    analyzeGraph() {
        const vertexCount = this.nodes.length;
        const edgeCount = this.edges.length;
        const degrees = {};
        const isConnected = this.checkConnectivity();
        const hasCycle = this.detectCycle();

        this.nodes.forEach(node => {
            degrees[node.label] = this.getNeighbors(node.id).length;
        });

        return {
            vertexCount,
            edgeCount,
            degrees,
            isConnected,
            hasCycle
        };
    }

    checkConnectivity() {
        if (this.nodes.length === 0) return true;
        
        const visited = new Set();
        const startNode = this.nodes.get(1).id;
        
        const dfs = (node) => {
            visited.add(node);
            const neighbors = this.getNeighbors(node);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            });
        };

        dfs(startNode);
        return visited.size === this.nodes.length;
    }

    detectCycle() {
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (node) => {
            visited.add(node);
            recursionStack.add(node);

            const neighbors = this.getNeighbors(node);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (dfs(neighbor)) return true;
                } else if (recursionStack.has(neighbor)) {
                    return true;
                }
            }

            recursionStack.delete(node);
            return false;
        };

        for (const node of this.nodes.get()) {
            if (!visited.has(node.id)) {
                if (dfs(node.id)) return true;
            }
        }

        return false;
    }

    displayProperties(properties) {
        const resultContainer = document.getElementById('propertiesResult');
        const resultContent = document.getElementById('propertiesResultContent');
        
        if (!resultContainer || !resultContent) return;

        let html = `
            <div class="property-item">
                <strong>Number of Vertices:</strong> ${properties.vertexCount}
            </div>
            <div class="property-item">
                <strong>Number of Edges:</strong> ${properties.edgeCount}
            </div>
            <div class="property-item">
                <strong>Vertex Degrees:</strong>
                <ul>
                    ${Object.entries(properties.degrees)
                        .map(([vertex, degree]) => `<li>${vertex}: ${degree}</li>`)
                        .join('')}
                </ul>
            </div>
            <div class="property-item">
                <strong>Connected:</strong> ${properties.isConnected ? 'Yes' : 'No'}
            </div>
            <div class="property-item">
                <strong>Contains Cycle:</strong> ${properties.hasCycle ? 'Yes' : 'No'}
            </div>
        `;

        resultContent.innerHTML = html;
        resultContainer.style.display = 'block';
    }

    promptAddEdge() {
        const from = prompt('Enter source node (A, B, C, ...):');
        const to = prompt('Enter target node (A, B, C, ...):');
        
        if (from && to) {
            const fromId = from.charCodeAt(0) - 64;
            const toId = to.charCodeAt(0) - 64;
            
            if (this.nodes.get(fromId) && this.nodes.get(toId)) {
                if (fromId === toId) {
                    DMC.showError('Self-loops are not allowed');
                    return;
                }
                
                const existingEdge = this.edges.get().find(e => 
                    (e.from === fromId && e.to === toId) || 
                    (e.from === toId && e.to === fromId)
                );
                
                if (existingEdge) {
                    DMC.showError('Edge already exists');
                    return;
                }
                
                this.addEdge(fromId, toId);
                DMC.showSuccess(`Added edge ${from} → ${to}`);
            } else {
                DMC.showError('Invalid node(s)');
            }
        }
    }

    runSelectedAlgorithm() {
        const algorithm = document.getElementById('algorithmType').value;
        const startNode = document.getElementById('startNode').value;
        
        if (!startNode) {
            DMC.showError('Please enter a start node');
            return;
        }

        const startId = startNode.charCodeAt(0) - 64;
        if (!this.nodes.get(startId)) {
            DMC.showError('Invalid start node');
            return;
        }

        this.isAnimating = true;
        this.resetColors();

        switch (algorithm) {
            case 'bfs':
                this.visualizeBFS(startId);
                break;
            case 'dfs':
                this.visualizeDFS(startId);
                break;
            case 'shortestPath':
                const endNode = document.getElementById('endNode').value;
                if (!endNode) {
                    DMC.showError('Please enter an end node');
                    this.isAnimating = false;
                    return;
                }
                const endId = endNode.charCodeAt(0) - 64;
                if (!this.nodes.get(endId)) {
                    DMC.showError('Invalid end node');
                    this.isAnimating = false;
                    return;
                }
                this.visualizeShortestPath(startId, endId);
                break;
            case 'minimumSpanningTree':
                this.visualizeMinimumSpanningTree();
                break;
            case 'topologicalSort':
                this.visualizeTopologicalSort();
                break;
            case 'eulerianPath':
                this.visualizeEulerianPath();
                break;
            case 'hamiltonianPath':
                this.visualizeHamiltonianPath();
                break;
        }
    }

    resetColors() {
        this.nodes.get().forEach(node => {
            this.nodes.update({
                id: node.id,
                color: {
                    background: '#5e35b1',
                    border: '#280680'
                }
            });
        });
        this.edges.get().forEach(edge => {
            this.edges.update({
                id: edge.id,
                color: { color: '#666666' }
            });
        });
    }

    visualizeMinimumSpanningTree() {
        const edges = this.edges.get();
        const nodes = this.nodes.get();
        const mst = [];
        const visited = new Set();
        const delay = 1000 / this.animationSpeed;

        edges.sort((a, b) => Math.random() - 0.5);
        let edgeIndex = 0;

        const animate = () => {
            if (edgeIndex >= edges.length) {
                this.isAnimating = false;
                DMC.showSuccess('Minimum Spanning Tree complete');
                return;
            }

            const edge = edges[edgeIndex];
            if (!visited.has(edge.from) || !visited.has(edge.to)) {
                visited.add(edge.from);
                visited.add(edge.to);
                mst.push(edge);
                this.edges.update({
                    id: edge.id,
                    color: { color: '#ff4081' }
                });
            }

            edgeIndex++;
            setTimeout(animate, delay);
        };

        animate();
    }

    visualizeTopologicalSort() {
        const nodes = this.nodes.get();
        const visited = new Set();
        const temp = new Set();
        const order = [];
        const delay = 1000 / this.animationSpeed;

        const visit = (nodeId) => {
            if (temp.has(nodeId)) {
                DMC.showError('Graph contains a cycle - topological sort not possible');
                this.isAnimating = false;
                return false;
            }
            if (visited.has(nodeId)) return true;

            temp.add(nodeId);
            this.nodes.update({
                id: nodeId,
                color: { background: '#ff4081' }
            });

            const neighbors = this.getNeighbors(nodeId);
            for (const neighbor of neighbors) {
                if (!visit(neighbor)) return false;
            }

            temp.delete(nodeId);
            visited.add(nodeId);
            order.unshift(nodeId);
            return true;
        };

        const animate = () => {
            for (const node of nodes) {
                if (!visited.has(node.id)) {
                    if (!visit(node.id)) return;
                }
            }

            this.isAnimating = false;
            const result = order.map(id => String.fromCharCode(64 + id)).join(' → ');
            DMC.showSuccess(`Topological order: ${result}`);
        };

        setTimeout(animate, delay);
    }

    visualizeEulerianPath() {
        const nodes = this.nodes.get();
        const edges = this.edges.get();
        const degrees = {};
        let oddDegreeCount = 0;

        nodes.forEach(node => {
            degrees[node.id] = this.getNeighbors(node.id).length;
            if (degrees[node.id] % 2 !== 0) oddDegreeCount++;
        });

        if (oddDegreeCount > 2) {
            DMC.showError('Graph does not have an Eulerian path');
            this.isAnimating = false;
            return;
        }

        const startNode = nodes.find(node => degrees[node.id] % 2 !== 0) || nodes[0];
        this.visualizeDFS(startNode.id);
    }

    visualizeHamiltonianPath() {
        const nodes = this.nodes.get();
        const path = [];
        const visited = new Set();
        const delay = 1000 / this.animationSpeed;

        const findPath = (current) => {
            visited.add(current);
            path.push(current);
            this.nodes.update({
                id: current,
                color: { background: '#ff4081' }
            });

            if (path.length === nodes.length) {
                this.isAnimating = false;
                const result = path.map(id => String.fromCharCode(64 + id)).join(' → ');
                DMC.showSuccess(`Hamiltonian path found: ${result}`);
                return true;
            }

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (findPath(neighbor)) return true;
                }
            }

            visited.delete(current);
            path.pop();
            this.nodes.update({
                id: current,
                color: { background: '#5e35b1' }
            });
            return false;
        };

        setTimeout(() => {
            if (!findPath(nodes[0].id)) {
                DMC.showError('No Hamiltonian path exists');
                this.isAnimating = false;
            }
        }, delay);
    }

    highlightNode(nodeId) {
        if (!this.network) return;
        this.network.selectNodes([nodeId]);
        this.network.focus(nodeId, { scale: 1.2, animation: true });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const graphContainer = document.getElementById('graphVisualization');
    if (graphContainer) {
        new GraphVisualizer('graphVisualization');
    }
});