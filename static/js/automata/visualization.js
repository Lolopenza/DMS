export function visualizeDFA(dfa, currentStates = []) {
    const visContainer = document.getElementById('automata-visualization');
    visContainer.innerHTML = '';
    const width = 800;
    const height = 400;
    const svg = d3.select(visContainer)
        .append('svg')
        .attr('id', 'automata-svg')
        .attr('width', width)
        .attr('height', height);
    const nodeRadius = 30;
    const nodes = dfa.states.map((state, i) => ({
        id: state,
        x: 100 + (i * 150),
        y: height / 2,
        isStart: state === dfa.start_state,
        isAccept: dfa.accept_states.includes(state),
        isCurrent: currentStates.includes(state)
    }));

    for (const key in dfa.transitions) {
        const [fromState, symbol] = key.split(',');
        const toState = dfa.transitions[key];
        const fromNode = nodes.find(n => n.id === fromState);
        const toNode = nodes.find(n => n.id === toState);
        if (fromNode && toNode) {
            drawEdge(svg, fromNode, toNode, symbol);
        }
    }

    drawNodes(svg, nodes, nodeRadius);

    enableZoomPan(svg);

    visContainer.setAttribute('role', 'region');
    visContainer.setAttribute('aria-label', 'Automata Visualization');
}

export function visualizeNFA(nfa, currentStates = []) {
    const visContainer = document.getElementById('automata-visualization');
    visContainer.innerHTML = '';
    const width = 800;
    const height = 400;
    const nodeRadius = 30;
    const states = nfa.states;
    const nodes = states.map((state, i) => ({
        id: state,
        x: 100 + (i * 150),
        y: height / 2,
        isStart: state === nfa.start_state,
        isAccept: nfa.accept_states.includes(state),
        isCurrent: currentStates.includes(state)
    }));

    const svg = d3.select(visContainer)
        .append('svg')
        .attr('id', 'automata-svg')
        .attr('width', width)
        .attr('height', height);

    for (const [fromState, trans] of Object.entries(nfa.transitions)) {
        for (const [symbol, nextStates] of Object.entries(trans)) {
            for (const toState of nextStates) {
                const fromNode = nodes.find(n => n.id === fromState);
                const toNode = nodes.find(n => n.id === toState);
                if (fromNode && toNode) {
                    drawEdge(svg, fromNode, toNode, symbol, symbol === '');
                }
            }
        }
    }

    drawNodes(svg, nodes, nodeRadius);

    enableZoomPan(svg);

    visContainer.setAttribute('role', 'region');
    visContainer.setAttribute('aria-label', 'Automata Visualization');
}

function drawEdge(svg, fromNode, toNode, symbol, isEpsilon = false) {
    svg.append('path')
        .attr('d', `M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`)
        .attr('class', 'automata-edge')
        .attr('stroke', isEpsilon ? '#ffc107' : '#666')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-dasharray', isEpsilon ? '6,3' : '');

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    svg.append('text')
        .attr('class', 'automata-label')
        .attr('x', midX)
        .attr('y', midY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', isEpsilon ? '#ffc107' : '#666')
        .text(isEpsilon ? 'ε' : symbol);
}

function drawNodes(svg, nodes, nodeRadius) {
    const nodeGroup = svg.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeGroup.append('circle')
        .attr('r', nodeRadius)
        .attr('class', d => [
            'automata-state',
            d.isStart ? 'start-state' : '',
            d.isAccept ? 'accept-state' : '',
            d.isCurrent ? 'current-state state-transitioning' : ''
        ].join(' '))
        .attr('fill', d => d.isCurrent ? '#0dcaf0' : d.isAccept ? '#198754' : d.isStart ? '#0d6efd' : '#fff')
        .attr('stroke', d => {
            if (d.isStart && d.isAccept) return '#198754';
            if (d.isStart) return '#0d6efd';
            if (d.isAccept) return '#198754';
            return '#666';
        })
        .attr('stroke-width', 3)
        .transition().duration(300).attr('r', nodeRadius + 2).transition().duration(300).attr('r', nodeRadius);

    nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .attr('fill', '#000')
        .text(d => d.id);

    const startNode = nodes.find(n => n.isStart);
    if (startNode) {
        svg.append('path')
            .attr('d', `M${startNode.x - nodeRadius - 20},${startNode.y} L${startNode.x - nodeRadius},${startNode.y}`)
            .attr('stroke', '#0d6efd')
            .attr('stroke-width', 3);
    }
}

function enableZoomPan(svg) {
    setTimeout(() => {
        if (window.svgPanZoom) {
            window.svgPanZoom('#automata-svg', {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
                minZoom: 0.5,
                maxZoom: 10
            });
        }
    }, 100);
}