// Initial scaffolding for Adjacency Matrix Calculator

console.log('adjacency_matrix.js loaded');
if (window.Handsontable && Handsontable.version) {
    console.log('Handsontable version:', Handsontable.version);
}

function getOrLog(id) {
    const el = document.getElementById(id);
    if (!el) console.error('Element not found:', id);
    return el;
}

let nodeAttributes = {};

document.addEventListener('DOMContentLoaded', function() {
    // Handsontable matrix editor
    const matrixContainer = getOrLog('adjMatrixHot');
    const addRowBtn = getOrLog('addRowBtn');
    const removeRowBtn = getOrLog('removeRowBtn');
    const importBtn = getOrLog('importMatrixBtn');
    const exportBtn = getOrLog('exportMatrixBtn');
    const ocrBtn = getOrLog('ocrMatrixBtn');
    const powerSlider = getOrLog('matrixPowerSlider');
    const powerValue = getOrLog('matrixPowerValue');
    const powerResult = getOrLog('matrixPowerResult');
    const analysisDiv = getOrLog('matrixAnalysis');
    const graphContainer = getOrLog('adjGraphContainer');
    const directedToggle = getOrLog('directedToggle');
    const weightedToggle = getOrLog('weightedToggle');
    const refreshBtn = getOrLog('refreshMatrixBtn');
    const shortcutsBtn = getOrLog('matrixShortcutsHelp');
    const exampleBtn = getOrLog('exampleMatrixBtn');
    const batchBtn = getOrLog('runBatchAnalysisBtn');
    const exportAdjListBtn = getOrLog('exportAdjListBtn');
    const exportEdgeListBtn = getOrLog('exportEdgeListBtn');
    const validateBtn = getOrLog('validateMatrixBtn');

    if (!matrixContainer || !addRowBtn || !removeRowBtn || !importBtn || !exportBtn || !ocrBtn || !powerSlider || !powerValue || !powerResult || !analysisDiv || !graphContainer || !directedToggle || !weightedToggle || !refreshBtn || !shortcutsBtn || !exampleBtn || !batchBtn || !exportAdjListBtn || !exportEdgeListBtn || !validateBtn) {
        console.error('One or more required DOM elements are missing. Aborting initialization.');
        return;
    }

    // Default 5x5 zero matrix
    let matrixData = Array.from({length: 5}, () => Array(5).fill(0));

    // Handsontable instance
    const hot = new Handsontable(matrixContainer, {
        data: matrixData,
        rowHeaders: true,
        colHeaders: true,
        width: '100%',
        height: 320,
        manualRowResize: true,
        manualColumnResize: true,
        contextMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        afterChange: function() {
            // TODO: update graph and analysis
        },
        afterOnCellMouseDown: function(e, coords, td) {
            if (e.type === 'touchstart') {
                touchTimer = setTimeout(() => {
                    if (coords.row < 0 && coords.col >= 0) {
                        let label = prompt('Edit vertex label:', vertexLabels[coords.col]);
                        if (label) { vertexLabels[coords.col] = label; updateHeaders(); updateAllPanels(); }
                    } else if (coords.col < 0 && coords.row >= 0) {
                        let label = prompt('Edit vertex label:', vertexLabels[coords.row]);
                        if (label) { vertexLabels[coords.row] = label; updateHeaders(); updateAllPanels(); }
                    }
                }, 600); // long-press 600ms
            } else {
                if (coords.row < 0 && coords.col >= 0) {
                    let label = prompt('Edit vertex label:', vertexLabels[coords.col]);
                    if (label) { vertexLabels[coords.col] = label; updateHeaders(); updateAllPanels(); }
                    return;
                }
                if (coords.col < 0 && coords.row >= 0) {
                    let label = prompt('Edit vertex label:', vertexLabels[coords.row]);
                    if (label) { vertexLabels[coords.row] = label; updateHeaders(); updateAllPanels(); }
                    return;
                }
                if (coords.row < 0 || coords.col < 0) return;
                if (!weighted) {
                    let val = Number(hot.getDataAtCell(coords.row, coords.col)) || 0;
                    hot.setDataAtCell(coords.row, coords.col, val ? 0 : 1);
                }
            }
        },
        afterOnCellMouseUp: function(e, coords, td) {
            if (e.type === 'touchend' && touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
                if (coords.row >= 0 && coords.col >= 0 && !weighted) {
                    let val = Number(hot.getDataAtCell(coords.row, coords.col)) || 0;
                    hot.setDataAtCell(coords.row, coords.col, val ? 0 : 1);
                }
            }
        },
        beforeKeyDown: function(e) {
            // Keyboard navigation: arrows, tab, enter
            const sel = hot.getSelectedLast();
            if (!sel) return;
            let [row, col] = sel;
            if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
                e.preventDefault();
                hot.selectCell(row, Math.min(col+1, hot.countCols()-1));
            } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
                e.preventDefault();
                hot.selectCell(row, Math.max(col-1, 0));
            } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                hot.selectCell(Math.min(row+1, hot.countRows()-1), col);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                hot.selectCell(Math.max(row-1, 0), col);
            }
        }
    });

    // Add Row
    if (addRowBtn) addRowBtn.onclick = function() {
        try {
            const n = hot.countRows();
            if (typeof hot.alter === 'function') {
                hot.alter('insert_row_below', n - 1);
                hot.alter('insert_col_end');
            } else {
                throw new Error('Handsontable alter API not supported');
            }
            resizeLabels(hot.countRows());
            updateAllPanels();
        } catch (e) {
            alert('Failed to add row/col: ' + e.message);
        }
    };
    // Remove Row
    if (removeRowBtn) removeRowBtn.onclick = function() {
        try {
            if (hot.countRows() > 1 && hot.countCols() > 1) {
                const n = hot.countRows();
                if (typeof hot.alter === 'function') {
                    hot.alter('remove_row', n - 1);
                    hot.alter('remove_col', n - 1);
                } else {
                    throw new Error('Handsontable alter API not supported');
                }
                resizeLabels(hot.countRows());
                updateAllPanels();
            }
        } catch (e) {
            alert('Failed to remove row/col: ' + e.message);
        }
    };
    // Import Matrix
    if (importBtn) importBtn.onclick = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt,.csv,application/json,text/plain';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    let data = JSON.parse(ev.target.result);
                    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error();
                    hot.loadData(data);
                    resizeLabels(data.length);
                    updateAllPanels();
                } catch {
                    alert('Invalid matrix file. Must be a JSON array of arrays.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    // Export Matrix
    if (exportBtn) exportBtn.onclick = function() {
        const data = hot.getData();
        const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'adjacency_matrix.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 100);
    };
    // OCR
    if (ocrBtn) ocrBtn.onclick = function() {
        let modal = document.getElementById('matrixOcrModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'matrixOcrModal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Image to Matrix OCR Modal');
            modal.innerHTML = `
            <div class="modal-bg" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;display:flex;align-items:center;justify-content:center;">
                <div class="modal-content" style="background:#fff;padding:2rem;border-radius:12px;max-width:400px;width:100%;position:relative;">
                    <button id="closeMatrixOcrModal" style="position:absolute;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;" aria-label="Close OCR Modal">&times;</button>
                    <h3 style="margin-bottom:1rem;">Image to Matrix (OCR)</h3>
                    <input type="file" id="matrixOcrImageInput" accept="image/*" style="margin-bottom:1rem;" aria-label="Select image for OCR" />
                    <div id="matrixOcrPreview" style="margin-bottom:1rem;"></div>
                    <button id="runMatrixOcrBtn" class="btn btn-primary" style="margin-bottom:1rem;" aria-label="Run OCR">Convert</button>
                    <textarea id="matrixOcrResultText" class="form-control" rows="4" style="width:100%;margin-bottom:1rem;" readonly aria-label="OCR result"></textarea>
                    <button id="insertMatrixOcrBtn" class="btn btn-success" style="display:none;" aria-label="Insert OCR result to matrix">Insert to Matrix</button>
                </div>
            </div>`;
            document.body.appendChild(modal);
        }
        modal.style.display = 'block';
        setTimeout(() => {
            document.getElementById('matrixOcrImageInput').focus();
        }, 100);
        const closeBtn = document.getElementById('closeMatrixOcrModal');
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        closeBtn.onkeydown = function(e) { if (e.key === 'Enter' || e.key === ' ') { modal.style.display = 'none'; } };
        const ocrInput = document.getElementById('matrixOcrImageInput');
        const ocrPreview = document.getElementById('matrixOcrPreview');
        const runOcrBtn = document.getElementById('runMatrixOcrBtn');
        const ocrResultText = document.getElementById('matrixOcrResultText');
        const insertBtn = document.getElementById('insertMatrixOcrBtn');
        let selectedFile = null;
        ocrInput.value = '';
        ocrPreview.innerHTML = '';
        ocrResultText.value = '';
        insertBtn.style.display = 'none';
        ocrInput.onchange = function() {
            if (this.files && this.files[0]) {
                selectedFile = this.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    ocrPreview.innerHTML = `<img src='${e.target.result}' alt='Preview' style='max-width:100%;max-height:180px;border:1px solid #ccc;border-radius:6px;' />`;
                };
                reader.readAsDataURL(selectedFile);
            } else {
                ocrPreview.innerHTML = '';
                selectedFile = null;
            }
        };
        runOcrBtn.onclick = async function() {
            if (!selectedFile) {
                ocrResultText.value = 'Please select an image file.';
                insertBtn.style.display = 'none';
                return;
            }
            ocrResultText.value = 'Processing...';
            const formData = new FormData();
            formData.append('image', selectedFile);
            try {
                const resp = await fetch('/api/image_to_text', {
                    method: 'POST',
                    body: formData
                });
                const data = await resp.json();
                if (data.text) {
                    ocrResultText.value = data.text;
                    insertBtn.style.display = 'inline-block';
                } else {
                    ocrResultText.value = data.error || 'OCR failed.';
                    insertBtn.style.display = 'none';
                }
            } catch (e) {
                ocrResultText.value = 'OCR failed.';
                insertBtn.style.display = 'none';
            }
        };
        insertBtn.onclick = function() {
            const text = ocrResultText.value;
            try {
                let matrix = parseCSV(text);
                if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) throw new Error();
                hot.loadData(matrix);
                modal.style.display = 'none';
            } catch {
                ocrResultText.value = 'Could not parse matrix from OCR result.';
            }
        };
        modal.onkeydown = function(e) {
            if (e.key === 'Escape') modal.style.display = 'none';
        };
    };
    // Refresh
    if (refreshBtn) refreshBtn.onclick = function() {
        const n = hot.countRows();
        hot.loadData(Array.from({length: n}, () => Array(n).fill(0)));
        updateAllPanels();
    };
    // Shortcuts
    if (shortcutsBtn) shortcutsBtn.onclick = function() {
        alert(`Matrix Editor Shortcuts:\n\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+A: Select All\nDelete: Clear Selection\nCtrl++: Add Row/Col\nCtrl+-: Remove Row/Col\nArrows/Tab/Enter: Navigate\nClick header: Edit label\nClick cell: Toggle 0/1`);
    };
    // Example
    if (exampleBtn) exampleBtn.onclick = function() {
        hot.loadData([
            [0,1,0,0],
            [1,0,1,1],
            [0,1,0,1],
            [0,1,1,0]
        ]);
        resizeLabels(4);
        updateAllPanels();
    };
    // Batch Analysis
    if (batchBtn) batchBtn.onclick = function() {
        const panel = document.getElementById('batchAnalysisPanel');
        if (panel) {
            panel.innerHTML = '<div class="text-muted">Running batch analysis...</div>';
            const matrix = hot.getData();
            const directed = directedToggle.checked;
            batchAnalysis(matrix, directed).then(results => {
                panel.innerHTML = renderBatchAnalysisTable(results, directed);
                document.getElementById('exportBatchAnalysisBtn').onclick = () => exportBatchAnalysisCSV(results, directed);
            });
        }
    };
    // Export Adjacency List
    if (exportAdjListBtn) exportAdjListBtn.onclick = exportAdjacencyList;
    // Export Edge List
    if (exportEdgeListBtn) exportEdgeListBtn.onclick = exportEdgeList;
    // Validate
    if (validateBtn) validateBtn.onclick = validateMatrix;

    // D3.js graph placeholder
    graphContainer.innerHTML = '<svg width="100%" height="400"></svg>';

    let directed = false;
    let weighted = false;

    // --- Vertex labels ---
    let vertexLabels = Array.from({length: hot.countRows()}, (_, i) => `v${i+1}`);
    function updateHeaders() {
        hot.updateSettings({
            rowHeaders: function(index) { return vertexLabels[index] || `v${index+1}`; },
            colHeaders: function(index) { return vertexLabels[index] || `v${index+1}`; }
        });
    }
    function resizeLabels(n) {
        if (vertexLabels.length < n) {
            for (let i = vertexLabels.length; i < n; ++i) vertexLabels.push(`v${i+1}`);
        } else if (vertexLabels.length > n) {
            vertexLabels = vertexLabels.slice(0, n);
        }
        updateHeaders();
    }
    hot.addHook('afterCreateRow', () => { resizeLabels(hot.countRows()); updateAllPanels(); });
    hot.addHook('afterCreateCol', () => { resizeLabels(hot.countCols()); updateAllPanels(); });
    hot.addHook('afterRemoveRow', () => { resizeLabels(hot.countRows()); updateAllPanels(); });
    hot.addHook('afterRemoveCol', () => { resizeLabels(hot.countCols()); updateAllPanels(); });
    updateHeaders();

    hot.updateSettings({
        afterChange: function() { updateAllPanels(hot.getSelectedLast()); },
        afterSelection: function(r, c) { updateAllPanels([r, c]); }
    });

    directedToggle.onchange = function() { console.log('Directed toggle', directedToggle.checked); updateAllPanels(hot.getSelectedLast()); };
    weightedToggle.onchange = function() { console.log('Weighted toggle', weightedToggle.checked); updateAllPanels(hot.getSelectedLast()); };

    // --- n slider (matrix size) ---
    const matrixSizeSlider = getOrLog('matrixSizeSlider');
    const matrixSizeValue = getOrLog('matrixSizeValue');
    if (matrixSizeSlider && matrixSizeValue) {
        matrixSizeSlider.oninput = function() {
            const n = parseInt(matrixSizeSlider.value, 10);
            matrixSizeValue.textContent = n;
            resizeMatrix(n);
            updateAllPanels();
        };
    }
    function resizeMatrix(n) {
        let data = hot.getData();
        let m = data.length;
        if (n > m) {
            for (let i = m; i < n; ++i) {
                data.push(Array(n).fill(0));
            }
            for (let i = 0; i < n; ++i) {
                if (data[i].length < n) data[i] = data[i].concat(Array(n - data[i].length).fill(0));
            }
        } else if (n < m) {
            data = data.slice(0, n).map(row => row.slice(0, n));
        }
        hot.loadData(data);
        resizeLabels(n);
    }
    // --- LaTeX matrix rendering ---
    function renderLatexMatrix(matrix, power) {
        let latex = `\\left(\\begin{array}{${'c'.repeat(matrix.length)}}`;
        latex += matrix.map(row => row.join(' & ')).join(' \\ ');
        latex += '\\end{array}\\right)';
        if (typeof power === 'number' && power > 1) latex = `(${latex})^{${power}}`;
        else latex = `(${latex})`;
        return latex;
    }
    async function updateLatexPanel(matrix, power) {
        const latexDiv = document.getElementById('adjMatrixLatex');
        if (!latexDiv) return;
        let latex = renderLatexMatrix(matrix, 1);
        const safeMatrix = sanitizeMatrix(matrix);
        if (!Array.isArray(safeMatrix) || !safeMatrix.length || safeMatrix.length !== safeMatrix[0].length) {
            latexDiv.innerHTML = '<span style="color:red">Matrix must be square.</span>';
            return;
        }
        try {
            const resp = await fetch('/api/adjacency_matrix/power', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix: safeMatrix, power })
            });
            if (!resp.ok) throw new Error('Backend error: ' + resp.status);
            const data = await resp.json();
            if (data.result) {
                latex += `^{${power}} = ` + renderLatexMatrix(data.result, null);
            } else if (data.error) {
                latex += `<br><span style='color:red'>${data.error}</span>`;
            }
        } catch (e) {
            latex += `<br><span style='color:red'>Matrix power calculation failed: ${e.message}</span>`;
        }
        latexDiv.innerHTML = `$$${latex}$$`;
        if (window.MathJax) MathJax.typesetPromise([latexDiv]);
    }
    // --- Spreadsheet cell coloring ---
    function colorMatrixCells() {
        const tdList = document.querySelectorAll('#adjMatrixHot .htCore td');
        tdList.forEach(td => {
            const val = td.textContent.trim();
            td.classList.remove('ht-black');
            if (val === '1') td.classList.add('ht-black');
        });
    }
    // --- Graph visualization update and highlight ---
    function updateGraphWithHighlight(selectedCell) {
        const matrix = hot.getData();
        const directed = directedToggle.checked;
        const weighted = weightedToggle.checked;
        const {nodes, edges} = matrixToGraph(matrix, directed, weighted, vertexLabels);
        let highlight = {};
        if (selectedCell && selectedCell.length === 2) {
            const [i, j] = selectedCell;
            highlight = {
                node: d => d.id === i+1 || d.id === j+1,
                edge: d => d.source === i+1 && d.target === j+1
            };
        }
        renderGraphD3(graphContainer, nodes, edges, directed, weighted, highlight);
    }
    // --- Add refresh button to reset matrix ---
    if (!document.getElementById('refreshMatrixBtn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshMatrixBtn';
        refreshBtn.className = 'btn btn-outline-secondary btn-sm';
        refreshBtn.title = 'Reset matrix to all zeros';
        refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
        refreshBtn.onclick = function() {
            const n = hot.countRows();
            hot.loadData(Array.from({length: n}, () => Array(n).fill(0)));
            updateAllPanels();
        };
        const toolbar = document.getElementById('matrixToolbar');
        if (toolbar) toolbar.insertBefore(refreshBtn, toolbar.firstChild);
    }
    // --- Add tooltips to sliders ---
    matrixSizeSlider.title = 'Adjust matrix size (n)';
    powerSlider.title = 'Adjust matrix power (p)';
    // --- Patch updateAllPanels to update graph, LaTeX, and cell coloring ---
    const origUpdateAllPanels2 = updateAllPanels;
    updateAllPanels = function(selectedCell) {
        const matrix = hot.getData();
        const p = parseInt(powerSlider.value, 10);
        origUpdateAllPanels2(selectedCell);
        updateLatexPanel(matrix, p);
        setTimeout(colorMatrixCells, 50);
        updateGraphWithHighlight(selectedCell);
    };
    // --- Always show LaTeX for current n, even for n < 7 ---
    async function updateLatexPanel(matrix, power) {
        const latexDiv = document.getElementById('adjMatrixLatex');
        if (!latexDiv) return;
        let latex = renderLatexMatrix(matrix, 1);
        if (!Array.isArray(matrix) || !matrix.length || matrix.length !== matrix[0].length) {
            latexDiv.innerHTML = '<span style="color:red">Matrix must be square.</span>';
            return;
        }
        try {
            const resp = await fetch('/api/adjacency_matrix/power', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix, power })
            });
            if (!resp.ok) throw new Error('Backend error: ' + resp.status);
            const data = await resp.json();
            if (data.result) {
                latex += `^{${power}} = ` + renderLatexMatrix(data.result, null);
            }
        } catch {}
        latexDiv.innerHTML = `$$${latex}$$`;
        if (window.MathJax) MathJax.typesetPromise([latexDiv]);
    }
    // --- Initial render ---
    updateAllPanels();

    // Add export SVG/PNG buttons to graph panel
    const graphPanel = document.querySelector('.adj-matrix-panel.graph');
    if (graphPanel && !document.getElementById('exportGraphSvgBtn')) {
        const toolbar = document.createElement('div');
        toolbar.className = 'mb-2 d-flex gap-2';
        toolbar.innerHTML = `
            <button id="exportGraphSvgBtn" class="btn btn-outline-secondary btn-sm" aria-label="Export Graph as SVG">Export SVG</button>
            <button id="exportGraphPngBtn" class="btn btn-outline-secondary btn-sm" aria-label="Export Graph as PNG">Export PNG</button>
        `;
        graphPanel.insertBefore(toolbar, graphPanel.children[1]);
        document.getElementById('exportGraphSvgBtn').onclick = function() {
            exportGraphSVG();
        };
        document.getElementById('exportGraphPngBtn').onclick = function() {
            exportGraphPNG();
        };
    }
    function exportGraphSVG() {
        const svg = document.querySelector('#adjGraphContainer svg');
        if (!svg) return alert('No graph to export.');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    function exportGraphPNG() {
        const svg = document.querySelector('#adjGraphContainer svg');
        if (!svg) return alert('No graph to export.');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const img = new Image();
        const svgBlob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = svg.width.baseVal.value || 400;
            canvas.height = svg.height.baseVal.value || 400;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(function(blob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'graph.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(a.href), 100);
            }, 'image/png');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    // --- Keyboard shortcuts for matrix editing ---
    document.addEventListener('keydown', function(e) {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            hot.undo();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            hot.redo();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            hot.selectAll();
        } else if (e.key === 'Delete') {
            const sel = hot.getSelected();
            if (sel) {
                e.preventDefault();
                sel.forEach(([r1, c1, r2, c2]) => {
                    for (let r = r1; r <= r2; ++r) for (let c = c1; c <= c2; ++c) hot.setDataAtCell(r, c, 0);
                });
            }
        } else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            hot.alter('insert_row');
            hot.alter('insert_col');
        } else if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
            e.preventDefault();
            if (hot.countRows() > 1 && hot.countCols() > 1) {
                hot.alter('remove_row');
                hot.alter('remove_col');
            }
        }
    });
    // --- Show help tooltip for shortcuts ---
    if (!document.getElementById('matrixShortcutsHelp')) {
        const helpBtn = document.createElement('button');
        helpBtn.id = 'matrixShortcutsHelp';
        helpBtn.className = 'btn btn-outline-info btn-sm';
        helpBtn.style.marginLeft = '0.5rem';
        helpBtn.innerHTML = '<i class="fas fa-keyboard"></i> Shortcuts';
        helpBtn.setAttribute('aria-label', 'Show keyboard shortcuts');
        helpBtn.onclick = function() {
            alert(`Matrix Editor Shortcuts:\n\nCtrl+Z: Undo\nCtrl+Y: Redo\nCtrl+A: Select All\nDelete: Clear Selection\nCtrl++: Add Row/Col\nCtrl+-: Remove Row/Col\nArrows/Tab/Enter: Navigate\nClick header: Edit label\nClick cell: Toggle 0/1`);
        };
        const toolbar = document.getElementById('matrixToolbar');
        if (toolbar) toolbar.appendChild(helpBtn);
    }

    // --- Touch support for D3 graph node drag ---
    function renderGraphD3(container, nodes, edges, directed, weighted, highlight = {}) {
        container.innerHTML = '';
        const width = container.offsetWidth || 400;
        const height = 400;
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height);
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width/2, height/2));
        const link = svg.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.7)
            .selectAll('line')
            .data(edges)
            .enter().append('line')
            .attr('stroke-width', d => weighted ? Math.max(1, d.weight) : 2)
            .attr('stroke', d => highlight.edge && highlight.edge(d) ? '#f00' : '#999');
        if (directed) {
            link.attr('marker-end', 'url(#arrowhead)');
            svg.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '-0 -5 10 10')
                .attr('refX', 23)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#999')
                .style('stroke','none');
        }
        const edgeLabels = svg.append('g')
            .selectAll('text')
            .data(weighted ? edges : [])
            .enter().append('text')
            .attr('font-size', 12)
            .attr('fill', '#333')
            .text(d => d.weight);
        const node = svg.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 18)
            .attr('fill', d => highlight.node && highlight.node(d) ? '#f9c846' : '#6366f1')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('click', function(event, d) {
                hot.selectCell(d.id-1, d.id-1);
                updateAllPanels([d.id-1, d.id-1]);
            })
            .on('touchstart', function(event, d) {
                event.preventDefault();
                dragstarted(event, d);
            })
            .on('touchmove', function(event, d) {
                event.preventDefault();
                dragged(event, d);
            })
            .on('touchend', function(event, d) {
                event.preventDefault();
                dragended(event, d);
            });
        const labels = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .text(d => d.label);
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);
            labels.attr('x', d => d.x)
                .attr('y', d => d.y);
            edgeLabels.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
        });
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            if (event.type && event.type.startsWith('touch')) {
                const touch = event.touches[0];
                d.fx = touch.clientX - container.getBoundingClientRect().left;
                d.fy = touch.clientY - container.getBoundingClientRect().top;
            } else {
            d.fx = event.x;
            d.fy = event.y;
            }
        }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    async function updateMatrixPowerPanel(matrix, p, panel) {
        if (!matrix.length || !matrix[0].length) {
            panel.innerHTML = '';
            return;
        }
        const safeMatrix = sanitizeMatrix(matrix);
        if (!Array.isArray(safeMatrix) || safeMatrix.length !== safeMatrix[0].length) {
            panel.innerHTML = '<span class="text-danger">Matrix must be square.</span>';
            return;
        }
        try {
            const resp = await fetch('/api/adjacency_matrix/power', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix: safeMatrix, power: p })
            });
            if (!resp.ok) throw new Error('Backend error: ' + resp.status);
            let data;
            try { data = await resp.json(); } catch (err) { throw new Error('Invalid JSON from backend'); }
            if (!data.result) throw new Error(data.error || 'No result');
            const pow = data.result;
            panel.innerHTML = `<b>A<sup>${p}</sup></b> (number of walks of length ${p}):` + renderMatrixTable(pow) + `<div class='text-end small text-muted'>Source: <span class='badge ${data.source==='mcp'?'bg-success':'bg-secondary'}'>${data.source==='mcp'?'MCP':'Local'}</span>${data.error?` <span class='text-danger'>${data.error}</span>`:''}</div>`;
            setMcpStatus(data.source === 'mcp', data.error);
        } catch (e) {
            panel.innerHTML = `<span class='text-danger'>Matrix power calculation failed: ${e.message}</span>`;
            setMcpStatus(false, e.message);
        }
    }

    function setMcpStatus(isMcp, error) {
        let status = document.getElementById('mcpStatus');
        if (!status) {
            status = document.createElement('div');
            status.id = 'mcpStatus';
            status.style.position = 'fixed';
            status.style.top = '10px';
            status.style.right = '10px';
            status.style.zIndex = 1000;
            document.body.appendChild(status);
        }
        status.innerHTML = `<span class='badge ${isMcp?'bg-success':'bg-secondary'}'>${isMcp?'MCP':'Local'}</span>${error?` <span class='text-danger'>${error}</span>`:''}`;
    }

    // --- Node attributes ---
    function getNodeAttr(idx) {
        if (!nodeAttributes[idx]) nodeAttributes[idx] = { label: vertexLabels[idx] || `v${idx+1}`, color: '#6366f1' };
        return nodeAttributes[idx];
    }
    function setNodeAttr(idx, attr) {
        nodeAttributes[idx] = { ...getNodeAttr(idx), ...attr };
    }
    // --- Edit node attributes modal ---
    function showEditNodeModal(idx) {
        let modal = document.getElementById('editNodeModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'editNodeModal';
            modal.innerHTML = `<div class='modal-bg' style='position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;display:flex;align-items:center;justify-content:center;'>
                <div class='modal-content' style='background:#fff;padding:2rem;border-radius:12px;max-width:340px;width:100%;position:relative;'>
                    <button id='closeEditNodeModal' style='position:absolute;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;' aria-label='Close'>&times;</button>
                    <h3>Edit Node</h3>
                    <div class='mb-2'>
                        <label>Label: <input id='editNodeLabel' type='text' class='form-control'></label>
                    </div>
                    <div class='mb-2'>
                        <label>Color: <input id='editNodeColor' type='color' class='form-control' style='width:50px;height:32px;padding:0;border:none;'></label>
                    </div>
                    <button id='saveEditNodeBtn' class='btn btn-primary'>Save</button>
                </div>
            </div>`;
            document.body.appendChild(modal);
        }
        const attr = getNodeAttr(idx);
        document.getElementById('editNodeLabel').value = attr.label;
        document.getElementById('editNodeColor').value = attr.color;
        modal.style.display = 'block';
        document.getElementById('closeEditNodeModal').onclick = () => { modal.style.display = 'none'; };
        document.getElementById('saveEditNodeBtn').onclick = () => {
            setNodeAttr(idx, {
                label: document.getElementById('editNodeLabel').value,
                color: document.getElementById('editNodeColor').value
            });
            vertexLabels[idx] = document.getElementById('editNodeLabel').value;
            updateHeaders();
            updateAllPanels([idx, idx]);
            modal.style.display = 'none';
        };
    }
    // --- Batch analysis ---
    async function batchAnalysis(matrix, directed) {
        const n = matrix.length;
        const safeMatrix = sanitizeMatrix(matrix);
        const results = [];
        for (let i = 0; i < n; ++i) {
            try {
                const [degResp, neighResp] = await Promise.all([
                    fetch('/api/adjacency_matrix/degree', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ matrix: safeMatrix, node: i, directed })
                    }).then(async r => { if (!r.ok) throw new Error('Degree API error: ' + r.status); return r.json(); }),
                    fetch('/api/adjacency_matrix/neighbors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ matrix: safeMatrix, node: i, directed })
                    }).then(async r => { if (!r.ok) throw new Error('Neighbors API error: ' + r.status); return r.json(); })
                ]);
                results.push({
                    idx: i,
                    label: getNodeAttr(i).label,
                    color: getNodeAttr(i).color,
                    degree: degResp.result,
                    neighbors: neighResp.result
                });
            } catch (e) {
                results.push({
                    idx: i,
                    label: getNodeAttr(i).label,
                    color: getNodeAttr(i).color,
                    degree: { error: e.message },
                    neighbors: { error: e.message }
                });
            }
        }
        return results;
    }
    function renderBatchAnalysisTable(results, directed) {
        let html = `<div class='table-responsive'><table class='table table-bordered table-sm text-center' style='background:#fff;'>`;
        html += `<thead><tr><th>Node</th><th>Label</th><th>Color</th>`;
        if (directed) html += `<th title='Incoming edges'>In-degree</th><th title='Outgoing edges'>Out-degree</th><th>Total</th><th title='Nodes with edges to this node'>In-neighbors</th><th title='Nodes this node points to'>Out-neighbors</th>`;
        else html += `<th title='Edges'>Degree</th><th title='Neighbors'>Neighbors</th>`;
        html += `<th>Edit</th></tr></thead><tbody>`;
        for (const r of results) {
            html += `<tr><td>${r.idx+1}</td><td>${r.label}</td><td><span style='display:inline-block;width:18px;height:18px;background:${r.color};border-radius:50%;border:1px solid #ccc;'></span></td>`;
            if (directed) {
                html += `<td>${r.degree.in_degree}</td><td>${r.degree.out_degree}</td><td>${r.degree.total}</td>`;
                html += `<td>${(r.neighbors.in_neighbors||[]).map(i=>i+1).join(', ')}</td><td>${(r.neighbors.out_neighbors||[]).map(i=>i+1).join(', ')}</td>`;
            } else {
                html += `<td>${r.degree.degree}</td><td>${(r.neighbors.neighbors||[]).map(i=>i+1).join(', ')}</td>`;
            }
            html += `<td><button class='btn btn-outline-secondary btn-sm' title='Edit node' onclick='showEditNodeModal(${r.idx})'><i class='fas fa-edit'></i></button></td></tr>`;
        }
        html += `</tbody></table></div>`;
        html += `<button id='exportBatchAnalysisBtn' class='btn btn-outline-success btn-sm mt-2'>Export CSV</button>`;
        return html;
    }
    function exportBatchAnalysisCSV(results, directed) {
        let csv = 'Node,Label,Color,';
        if (directed) csv += 'In-degree,Out-degree,Total,In-neighbors,Out-neighbors\n';
        else csv += 'Degree,Neighbors\n';
        for (const r of results) {
            csv += `${r.idx+1},${r.label},${r.color},`;
            if (directed) {
                csv += `${r.degree.in_degree},${r.degree.out_degree},${r.degree.total},"${(r.neighbors.in_neighbors||[]).map(i=>i+1).join(' ')}","${(r.neighbors.out_neighbors||[]).map(i=>i+1).join(' ')}"\n`;
            } else {
                csv += `${r.degree.degree},"${(r.neighbors.neighbors||[]).map(i=>i+1).join(' ')}"\n`;
            }
        }
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'adjacency_matrix_analysis.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 100);
    }
    // --- Add batch analysis button and panel ---
    function ensureBatchAnalysisUI() {
        let panel = document.getElementById('batchAnalysisPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'batchAnalysisPanel';
            panel.className = 'mt-3';
            const analysisSection = document.querySelector('.matrix-analysis-panel');
            if (analysisSection && analysisSection.parentNode) {
                analysisSection.parentNode.insertBefore(panel, analysisSection.nextSibling);
            } else {
                document.body.appendChild(panel);
            }
        }
        let btn = document.getElementById('runBatchAnalysisBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'runBatchAnalysisBtn';
            btn.className = 'btn btn-outline-primary btn-sm mb-2';
            btn.innerHTML = '<i class="fas fa-table"></i> Batch Analysis';
            panel.appendChild(btn);
        }
        btn.onclick = async function() {
            panel.innerHTML = '<div class="text-muted">Running batch analysis...</div>';
            const matrix = hot.getData();
            const directed = directedToggle.checked;
            const results = await batchAnalysis(matrix, directed);
            panel.innerHTML = renderBatchAnalysisTable(results, directed);
            document.getElementById('exportBatchAnalysisBtn').onclick = () => exportBatchAnalysisCSV(results, directed);
        };
    }
    // --- Patch D3 graph rendering to use node color/label ---
    function renderGraphD3(container, nodes, edges, directed, weighted, highlight = {}) {
        container.innerHTML = '';
        const width = container.offsetWidth || 400;
        const height = 400;
        const svg = d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height);
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width/2, height/2));
        const link = svg.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.7)
            .selectAll('line')
            .data(edges)
            .enter().append('line')
            .attr('stroke-width', d => weighted ? Math.max(1, d.weight) : 2)
            .attr('stroke', d => highlight.edge && highlight.edge(d) ? '#f00' : '#999');
        if (directed) {
            link.attr('marker-end', 'url(#arrowhead)');
            svg.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '-0 -5 10 10')
                .attr('refX', 23)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#999')
                .style('stroke','none');
        }
        const edgeLabels = svg.append('g')
            .selectAll('text')
            .data(weighted ? edges : [])
            .enter().append('text')
            .attr('font-size', 12)
            .attr('fill', '#333')
            .text(d => d.weight);
        const node = svg.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 18)
            .attr('fill', d => getNodeAttr(d.id-1).color)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('click', function(event, d) {
                hot.selectCell(d.id-1, d.id-1);
                updateAllPanels([d.id-1, d.id-1]);
            })
            .on('contextmenu', function(event, d) {
                event.preventDefault();
                showEditNodeModal(d.id-1);
            });
        const labels = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .text(d => getNodeAttr(d.id-1).label);
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);
            labels.attr('x', d => d.x)
                .attr('y', d => d.y);
            edgeLabels.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
        });
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            if (event.type && event.type.startsWith('touch')) {
                const touch = event.touches[0];
                d.fx = touch.clientX - container.getBoundingClientRect().left;
                d.fy = touch.clientY - container.getBoundingClientRect().top;
            } else {
            d.fx = event.x;
            d.fy = event.y;
            }
        }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    // --- Patch updateAllPanels to ensure batch analysis UI is present ---
    const origUpdateAllPanels4 = updateAllPanels;
    updateAllPanels = function(selectedCell) {
        const matrix = hot.getData();
        origUpdateAllPanels4(selectedCell);
        ensureBatchAnalysisUI();
    };

    // --- Toolbar: Add export/validate controls ---
    function ensureExtraToolbarUI() {
        let toolbar = document.getElementById('matrixToolbar');
        if (!toolbar) return;
        if (!document.getElementById('exportAdjListBtn')) {
            const btn = document.createElement('button');
            btn.id = 'exportAdjListBtn';
            btn.className = 'btn btn-outline-info btn-sm';
            btn.title = 'Export as Adjacency List (JSON)';
            btn.innerHTML = '<i class="fas fa-list"></i>';
            btn.onclick = exportAdjacencyList;
            toolbar.appendChild(btn);
        }
        if (!document.getElementById('exportEdgeListBtn')) {
            const btn = document.createElement('button');
            btn.id = 'exportEdgeListBtn';
            btn.className = 'btn btn-outline-info btn-sm';
            btn.title = 'Export as Edge List (CSV)';
            btn.innerHTML = '<i class="fas fa-project-diagram"></i>';
            btn.onclick = exportEdgeList;
            toolbar.appendChild(btn);
        }
        if (!document.getElementById('validateMatrixBtn')) {
            const btn = document.createElement('button');
            btn.id = 'validateMatrixBtn';
            btn.className = 'btn btn-outline-info btn-sm';
            btn.title = 'Validate Matrix (squareness, symmetry)';
            btn.innerHTML = '<i class="fas fa-check-circle"></i>';
            btn.onclick = validateMatrix;
            toolbar.appendChild(btn);
        }
    }
    // --- Export adjacency list ---
    async function exportAdjacencyList() {
        const matrix = hot.getData();
        try {
            const resp = await fetch('/api/adjacency_matrix/to_adjacency_list', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix })
            });
            const data = await resp.json();
            if (!data.result) throw new Error(data.error || 'No result');
            showAdjListModal(data.result);
        } catch (e) {
            alert('Adjacency list export failed: ' + e.message);
        }
    }
    function showAdjListModal(adjList) {
        let modal = document.getElementById('adjListModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'adjListModal';
            modal.innerHTML = `<div class='modal-bg' style='position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;display:flex;align-items:center;justify-content:center;'>
                <div class='modal-content' style='background:#fff;padding:2rem;border-radius:12px;max-width:420px;width:100%;position:relative;'>
                    <button id='closeAdjListModal' style='position:absolute;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;' aria-label='Close'>&times;</button>
                    <h3>Adjacency List</h3>
                    <pre id='adjListJson' style='background:#f8fafc;border-radius:8px;padding:1rem;max-height:300px;overflow:auto;'></pre>
                    <button id='downloadAdjListJsonBtn' class='btn btn-outline-success btn-sm mt-2'>Download JSON</button>
                </div>
            </div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('adjListJson').textContent = JSON.stringify(adjList, null, 2);
        modal.style.display = 'block';
        document.getElementById('closeAdjListModal').onclick = () => { modal.style.display = 'none'; };
        document.getElementById('downloadAdjListJsonBtn').onclick = () => {
            const blob = new Blob([JSON.stringify(adjList, null, 2)], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'adjacency_list.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(()=>URL.revokeObjectURL(url), 100);
        };
    }
    // --- Export edge list ---
    async function exportEdgeList() {
        const matrix = hot.getData();
        try {
            const resp = await fetch('/api/adjacency_matrix/to_edge_list', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix })
            });
            const data = await resp.json();
            if (!data.result) throw new Error(data.error || 'No result');
            let csv = 'from,to,weight\n';
            for (const row of data.result) csv += `${row[0]+1},${row[1]+1},${row[2]}\n`;
            const blob = new Blob([csv], {type:'text/csv'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edge_list.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(()=>URL.revokeObjectURL(url), 100);
        } catch (e) {
            alert('Edge list export failed: ' + e.message);
        }
    }
    // --- Validate matrix ---
    async function validateMatrix() {
        const matrix = hot.getData();
        try {
            const resp = await fetch('/api/adjacency_matrix/validate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix })
            });
            const data = await resp.json();
            if (!data.result) throw new Error(data.error || 'No result');
            showValidateModal(data.result);
        } catch (e) {
            alert('Matrix validation failed: ' + e.message);
        }
    }
    function showValidateModal(result) {
        let modal = document.getElementById('validateMatrixModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'validateMatrixModal';
            modal.innerHTML = `<div class='modal-bg' style='position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.3);z-index:2000;display:flex;align-items:center;justify-content:center;'>
                <div class='modal-content' style='background:#fff;padding:2rem;border-radius:12px;max-width:340px;width:100%;position:relative;'>
                    <button id='closeValidateMatrixModal' style='position:absolute;top:0.5rem;right:0.5rem;font-size:1.5rem;background:none;border:none;' aria-label='Close'>&times;</button>
                    <h3>Matrix Validation</h3>
                    <div id='validateMatrixResult'></div>
                </div>
            </div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('validateMatrixResult').innerHTML = `<b>Square:</b> ${result.square ? 'Yes' : 'No'}<br><b>Symmetric:</b> ${result.symmetric ? 'Yes' : 'No'}`;
        modal.style.display = 'block';
        document.getElementById('closeValidateMatrixModal').onclick = () => { modal.style.display = 'none'; };
    }
    // --- Attribute management: POST on edit ---
    async function saveNodeAttributesToBackend() {
        const matrix = hot.getData();
        try {
            const resp = await fetch('/api/adjacency_matrix/attributes', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix, attributes: nodeAttributes })
            });
            const data = await resp.json();
            // For now, just log/echo
            console.log('Attributes saved/echoed:', data.result);
        } catch (e) {
            console.warn('Attribute save failed:', e);
        }
    }
    // Patch node attribute edit modal to call backend
    const origShowEditNodeModal = showEditNodeModal;
    showEditNodeModal = function(idx) {
        origShowEditNodeModal(idx);
        const saveBtn = document.getElementById('saveEditNodeBtn');
        if (saveBtn) {
            const orig = saveBtn.onclick;
            saveBtn.onclick = function() {
                orig();
                saveNodeAttributesToBackend();
            };
        }
    };
    // --- Patch updateAllPanels to ensure extra toolbar UI is present ---
    const origUpdateAllPanels5 = updateAllPanels;
    updateAllPanels = function(selectedCell) {
        const matrix = hot.getData();
        origUpdateAllPanels5(selectedCell);
        ensureExtraToolbarUI();
    };

// --- Utility: Convert matrix to graph data ---
function matrixToGraph(matrix, directed, weighted, labels) {
    const n = matrix.length;
    const nodes = Array.from({length: n}, (_, i) => ({ id: i+1, label: labels[i] || `v${i+1}` }));
    const edges = [];
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
            const val = Number(matrix[i][j]) || 0;
            if (i === j) continue;
            if (weighted ? val !== 0 : val) {
                if (!directed && j < i) continue;
                edges.push(weighted ? { source: i+1, target: j+1, weight: val } : { source: i+1, target: j+1 });
            }
        }
    }
    return { nodes, edges };
}

// --- Analysis: Degree, Neighbors ---
    async function showNodeAnalysis(matrix, nodeIdx, analysisDiv, directed) {
        if (!Array.isArray(matrix) || matrix.length === 0 || nodeIdx == null || nodeIdx < 0 || nodeIdx >= matrix.length) {
            analysisDiv.innerHTML = '';
            return;
        }
        const safeMatrix = sanitizeMatrix(matrix);
        try {
            const [degResp, neighResp] = await Promise.all([
                fetch('/api/adjacency_matrix/degree', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ matrix: safeMatrix, node: nodeIdx, directed })
                }).then(async r => { if (!r.ok) throw new Error('Degree API error: ' + r.status); return r.json(); }),
                fetch('/api/adjacency_matrix/neighbors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ matrix: safeMatrix, node: nodeIdx, directed })
                }).then(async r => { if (!r.ok) throw new Error('Neighbors API error: ' + r.status); return r.json(); })
            ]);
            let html = `<b>Vertex ${nodeIdx+1}</b><br>`;
            if (degResp.result) {
                if (directed) {
                    html += `In-degree: ${degResp.result.in_degree}<br>Out-degree: ${degResp.result.out_degree}<br>Total: ${degResp.result.total}<br>`;
                } else {
                    html += `Degree: ${degResp.result.degree}<br>`;
                }
            }
            if (neighResp.result) {
                if (directed) {
                    html += `In-neighbors: {${(neighResp.result.in_neighbors||[]).map(i=>i+1).join(', ')}}<br>`;
                    html += `Out-neighbors: {${(neighResp.result.out_neighbors||[]).map(i=>i+1).join(', ')}}`;
                } else {
                    html += `Neighbors: {${(neighResp.result.neighbors||[]).map(i=>i+1).join(', ')}}`;
                }
            }
            analysisDiv.innerHTML = html;
        } catch (e) {
            analysisDiv.innerHTML = `<span class='text-danger'>Analysis failed: ${e.message}</span>`;
        }
    }

    // --- Matrix Power Calculation ---
    function matrixMultiply(a, b) {
        const n = a.length;
        const m = b[0].length;
        const k = b.length;
        const result = Array.from({length: n}, () => Array(m).fill(0));
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < m; ++j) {
                for (let l = 0; l < k; ++l) {
                    result[i][j] += (Number(a[i][l]) || 0) * (Number(b[l][j]) || 0);
                }
            }
        }
        return result;
    }

    function matrixPower(mat, p) {
        let res = mat.map(row => row.map(Number));
        let acc = Array.from({length: res.length}, (_, i) => res[0].map((_, j) => i === j ? 1 : 0));
        while (p > 0) {
            if (p % 2 === 1) acc = matrixMultiply(acc, res);
            res = matrixMultiply(res, res);
            p = Math.floor(p / 2);
        }
        return acc;
    }

    function renderMatrixTable(matrix) {
        let html = '<table class="table table-bordered table-sm text-center"><tbody>';
        for (let row of matrix) {
            html += '<tr>' + row.map(x => `<td>${x}</td>`).join('') + '</tr>';
        }
        html += '</tbody></table>';
        return html;
    }

    function updateAllPanels(selectedCell) {
        const matrix = hot.getData();
        // Update LaTeX preview
        if (typeof updateLatexPanel === 'function') {
            const p = parseInt(document.getElementById('matrixPowerSlider').value, 10);
            updateLatexPanel(matrix, p);
        }
        // Update graph
        if (typeof updateGraphWithHighlight === 'function') {
            updateGraphWithHighlight(selectedCell);
        }
        // Update matrix power and analysis
        if (typeof updateMatrixPowerPanel === 'function') {
            const p = parseInt(document.getElementById('matrixPowerSlider').value, 10);
            updateMatrixPowerPanel(matrix, p, document.getElementById('matrixPowerResult'));
        }
        if (typeof updateMatrixAnalysis === 'function') {
            updateMatrixAnalysis();
        }
        // Color cells if needed
        if (typeof colorMatrixCells === 'function') {
            setTimeout(colorMatrixCells, 50);
        }
        // Analysis panel
        const analysisDiv = document.getElementById('matrixAnalysis');
        let nodeIdx = null;
        if (selectedCell && selectedCell.length === 2 && selectedCell[0] >= 0) nodeIdx = selectedCell[0];
        else nodeIdx = 0;
        const directed = directedToggle.checked;
        showNodeAnalysis(matrix, nodeIdx, analysisDiv, directed);
    }

    ensureBatchAnalysisUI();
    // End of DOMContentLoaded
});

// --- Utility: Convert matrix to graph data ---
function matrixToGraph(matrix, directed, weighted, labels) {
    const n = matrix.length;
    const nodes = Array.from({length: n}, (_, i) => ({ id: i+1, label: labels[i] || `v${i+1}` }));
    const edges = [];
    for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
            const val = Number(matrix[i][j]) || 0;
            if (i === j) continue;
            if (weighted ? val !== 0 : val) {
                if (!directed && j < i) continue;
                edges.push(weighted ? { source: i+1, target: j+1, weight: val } : { source: i+1, target: j+1 });
            }
        }
    }
    return { nodes, edges };
}

// --- Analysis: Degree, Neighbors ---
async function showNodeAnalysis(matrix, nodeIdx, analysisDiv, directed) {
    if (!Array.isArray(matrix) || matrix.length === 0 || nodeIdx == null || nodeIdx < 0 || nodeIdx >= matrix.length) {
        analysisDiv.innerHTML = '';
        return;
    }
    try {
        const [degResp, neighResp] = await Promise.all([
            fetch('/api/adjacency_matrix/degree', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix, node: nodeIdx, directed })
            }).then(r => r.json()),
            fetch('/api/adjacency_matrix/neighbors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix, node: nodeIdx, directed })
            }).then(r => r.json())
        ]);
        let html = `<b>Vertex ${nodeIdx+1}</b><br>`;
        if (degResp.result) {
            if (directed) {
                html += `In-degree: ${degResp.result.in_degree}<br>Out-degree: ${degResp.result.out_degree}<br>Total: ${degResp.result.total}<br>`;
            } else {
                html += `Degree: ${degResp.result.degree}<br>`;
            }
        }
        if (neighResp.result) {
            if (directed) {
                html += `In-neighbors: {${(neighResp.result.in_neighbors||[]).map(i=>i+1).join(', ')}}<br>`;
                html += `Out-neighbors: {${(neighResp.result.out_neighbors||[]).map(i=>i+1).join(', ')}}`;
            } else {
                html += `Neighbors: {${(neighResp.result.neighbors||[]).map(i=>i+1).join(', ')}}`;
            }
        }
        analysisDiv.innerHTML = html;
    } catch (e) {
        analysisDiv.innerHTML = `<span class='text-danger'>Analysis failed: ${e.message}</span>`;
    }
}

// --- Matrix Power Calculation ---
function matrixMultiply(a, b) {
    const n = a.length;
    const m = b[0].length;
    const k = b.length;
    const result = Array.from({length: n}, () => Array(m).fill(0));
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < m; ++j) {
            for (let l = 0; l < k; ++l) {
                result[i][j] += (Number(a[i][l]) || 0) * (Number(b[l][j]) || 0);
            }
        }
    }
    return result;
}

function matrixPower(mat, p) {
    let res = mat.map(row => row.map(Number));
    let acc = Array.from({length: res.length}, (_, i) => res[0].map((_, j) => i === j ? 1 : 0));
    while (p > 0) {
        if (p % 2 === 1) acc = matrixMultiply(acc, res);
        res = matrixMultiply(res, res);
        p = Math.floor(p / 2);
    }
    return acc;
}

function renderMatrixTable(matrix) {
    let html = '<table class="table table-bordered table-sm text-center"><tbody>';
    for (let row of matrix) {
        html += '<tr>' + row.map(x => `<td>${x}</td>`).join('') + '</tr>';
    }
    html += '</tbody></table>';
    return html;
}

function updateAllPanels(selectedCell) {
    const matrix = hot.getData();
    // Update LaTeX preview
    if (typeof updateLatexPanel === 'function') {
        const p = parseInt(document.getElementById('matrixPowerSlider').value, 10);
        updateLatexPanel(matrix, p);
    }
    // Update graph
    if (typeof updateGraphWithHighlight === 'function') {
        updateGraphWithHighlight(selectedCell);
    }
    // Update matrix power and analysis
    if (typeof updateMatrixPowerPanel === 'function') {
        const p = parseInt(document.getElementById('matrixPowerSlider').value, 10);
        updateMatrixPowerPanel(matrix, p, document.getElementById('matrixPowerResult'));
    }
    if (typeof updateMatrixAnalysis === 'function') {
        updateMatrixAnalysis();
    }
    // Color cells if needed
    if (typeof colorMatrixCells === 'function') {
        setTimeout(colorMatrixCells, 50);
    }
    // Analysis panel
    const analysisDiv = document.getElementById('matrixAnalysis');
    let nodeIdx = null;
    if (selectedCell && selectedCell.length === 2 && selectedCell[0] >= 0) nodeIdx = selectedCell[0];
    else nodeIdx = 0;
    const directed = directedToggle.checked;
    showNodeAnalysis(matrix, nodeIdx, analysisDiv, directed);
}

// Add high-contrast toggle button
function ensureHighContrastToggle() {
    let controlsCard = document.querySelector('.matrix-card .matrix-controls');
    if (!controlsCard || document.getElementById('matrixHighContrastToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'matrixHighContrastToggle';
    btn.className = 'btn btn-outline-dark btn-sm ms-auto';
    btn.title = 'Toggle high-contrast mode';
    btn.setAttribute('aria-label', 'Toggle high-contrast mode');
    btn.innerHTML = '<i class="fas fa-adjust"></i>';
    btn.onclick = function() {
        const container = document.querySelector('.container');
        if (container.classList.contains('matrix-high-contrast')) {
            container.classList.remove('matrix-high-contrast');
        } else {
            container.classList.add('matrix-high-contrast');
        }
    };
    controlsCard.appendChild(btn);
}

// Patch updateAllPanels to ensure high-contrast toggle and ARIA/roles
const origUpdateAllPanels6 = updateAllPanels;
updateAllPanels = function(selectedCell) {
    origUpdateAllPanels6(selectedCell);
    ensureHighContrastToggle();
    // ARIA/roles for all major controls
    document.querySelectorAll('.matrix-controls button, .matrix-controls input, .matrix-controls select').forEach(el => {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        if (!el.hasAttribute('aria-label') && el.title) el.setAttribute('aria-label', el.title);
    });
    // ARIA for modals
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    });
    // ARIA for tables
    document.querySelectorAll('.matrix-panel table').forEach(tbl => {
        tbl.setAttribute('role', 'table');
    });
};

// Ensure matrix editor and graph are wrapped in .matrix-hot and .matrix-graph
function ensureMatrixHotGraphWrappers() {
    const hotDiv = document.getElementById('adjMatrixHot');
    if (hotDiv && !hotDiv.classList.contains('matrix-hot')) hotDiv.classList.add('matrix-hot');
    const graphDiv = document.getElementById('adjGraphContainer');
    if (graphDiv && !graphDiv.classList.contains('matrix-graph')) graphDiv.classList.add('matrix-graph');
}
ensureMatrixHotGraphWrappers();

// Patch modals for fade/slide transitions
function patchMatrixModals() {
    document.querySelectorAll('.modal-bg, .matrix-modal').forEach(modal => {
        if (!modal.classList.contains('show')) {
            setTimeout(() => modal.classList.add('show'), 10);
        }
        modal.addEventListener('transitionend', function() {
            if (!modal.style.display || modal.style.display === 'none') {
                modal.classList.remove('show');
            }
        });
    });
}
// Patch batch analysis panel for fade
function patchBatchAnalysisPanel() {
    const panel = document.getElementById('batchAnalysisPanel');
    if (panel && !panel.classList.contains('show')) {
        panel.classList.add('show');
        setTimeout(() => panel.classList.remove('show'), 400);
    }
}
// Patch after batch analysis
const origBatchAnalysisUI = ensureBatchAnalysisUI;
ensureBatchAnalysisUI = function() {
    origBatchAnalysisUI();
    patchBatchAnalysisPanel();
};

// Patch modals after show
const origShowAdjListModal = showAdjListModal;
showAdjListModal = function(adjList) {
    origShowAdjListModal(adjList);
    patchMatrixModals();
};
const origShowValidateModal = showValidateModal;
showValidateModal = function(result) {
    origShowValidateModal(result);
    patchMatrixModals();
};

// --- Utility: Sanitize matrix ---
function sanitizeMatrix(matrix) {
    return matrix.map(row => Array.isArray(row) ? row.map(x => {
        const v = Number(x);
        return (typeof v === 'number' && !isNaN(v) && isFinite(v)) ? v : 0;
    }) : []);
}
  