console.log('set_theory.js loaded');
if (!window.DMC) {
    alert('Critical error: DMC utility not loaded. Please reload the page or contact support.');
    throw new Error('DMC not loaded');
}
window.addEventListener('error', function(e) {
    console.error('Global JS error:', e.error || e.message || e);
    if (window.DMC && DMC.showError) DMC.showError('JS Error: ' + (e.error?.message || e.message));
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('set_theory.js DOMContentLoaded');
    // --- Utility: API call to new backend ---
    async function setTheoryApi(payload) {
        try {
            const resp = await fetch('/api/set_theory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await resp.json();
        } catch (e) {
            DMC.showError('API error: ' + e.message);
            return { error: e.message };
        }
    }
    // --- Named Sets/Universes Sidebar ---
    async function renderNamedSidebar() {
        let container = document.querySelector('.container');
        if (!container) return;
        let sidebar = document.getElementById('namedSetsSidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = 'namedSetsSidebar';
            sidebar.className = 'card shadow-sm p-3 mb-3';
            sidebar.style.maxWidth = '320px';
            sidebar.innerHTML = `<h5>Named Sets</h5><div id='namedSetsList'></div><h5 class='mt-3'>Named Universes</h5><div id='namedUniversesList'></div>`;
            container.insertBefore(sidebar, container.firstChild);
        }
        let list = sidebar.querySelector('#namedSetsList');
        let ulist = sidebar.querySelector('#namedUniversesList');
        if (!list || !ulist) return;
        try {
            const setsData = await setTheoryApi({action:'list_named_sets'});
            const sets = setsData.named_sets || {};
            list.innerHTML = '';
            for (const name in sets) {
                const div = document.createElement('div');
                div.className = 'd-flex align-items-center mb-2';
                div.innerHTML = `<span class='me-2 fw-bold'>${name}</span><button class='btn btn-outline-primary btn-sm me-1' title='Insert' aria-label='Insert' data-insert='${name}'>Insert</button><button class='btn btn-outline-danger btn-sm' title='Delete' aria-label='Delete' data-delete='${name}'>Delete</button>`;
                list.appendChild(div);
            }
            list.querySelectorAll('[data-insert]').forEach(btn=>{
                btn.onclick = function() {
                    const name = this.dataset.insert;
                    const val = sets[name];
                    if (document.getElementById('setA')) document.getElementById('setA').value = val;
                };
            });
            list.querySelectorAll('[data-delete]').forEach(btn=>{
                btn.onclick = async function() {
                    const name = this.dataset.delete;
                    await setTheoryApi({action:'delete_named_set',name});
                    renderNamedSidebar();
                };
            });
            const univData = await setTheoryApi({action:'list_named_universes'});
            const universes = univData.named_universes || {};
            ulist.innerHTML = '';
            for (const name in universes) {
                const div = document.createElement('div');
                div.className = 'd-flex align-items-center mb-2';
                div.innerHTML = `<span class='me-2 fw-bold'>${name}</span><button class='btn btn-outline-primary btn-sm me-1' title='Insert' aria-label='Insert' data-insert-univ='${name}'>Insert</button><button class='btn btn-outline-danger btn-sm' title='Delete' aria-label='Delete' data-delete-univ='${name}'>Delete</button>`;
                ulist.appendChild(div);
            }
            ulist.querySelectorAll('[data-insert-univ]').forEach(btn=>{
                btn.onclick = function() {
                    const name = this.dataset.insertUniv;
                    const val = universes[name];
                    if (document.getElementById('universe')) document.getElementById('universe').value = val;
                };
            });
            ulist.querySelectorAll('[data-delete-univ]').forEach(btn=>{
                btn.onclick = async function() {
                    const name = this.dataset.deleteUniv;
                    await setTheoryApi({action:'delete_named_universe',name});
                    renderNamedSidebar();
                };
            });
        } catch (e) {
            list.innerHTML = '<div class="text-danger">Failed to load named sets</div>';
            ulist.innerHTML = '<div class="text-danger">Failed to load universes</div>';
        }
    }
    function addSaveButtons() {
        [['setA','Save Set A'],['setB','Save Set B'],['universe','Save Universe']].forEach(([id,label])=>{
            const inp = document.getElementById(id);
            if (!inp) { console.warn('Input not found:', id); return; }
            if (inp && !inp.nextElementSibling?.classList?.contains('save-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-outline-secondary btn-sm ms-2 save-btn';
                btn.textContent = label;
                btn.onclick = async function() {
                    const val = inp.value;
                    const name = prompt('Name to save as?');
                    if (!name) return;
                    if (id==='universe') {
                        await setTheoryApi({action:'save_named_universe',name,value:val});
                    } else {
                        await setTheoryApi({action:'save_named_set',name,value:val});
                    }
                    renderNamedSidebar();
                };
                inp.parentNode.appendChild(btn);
            }
        });
    }
    // --- Set Operations ---
    async function runSetOperation(op, setA, setB, universe, resultContainer, vennContainer, explanationContainer) {
        try {
            if (op === 'complement' && (!universe || !universe.trim())) {
                DMC.showError('Universe must be provided for complement operation');
                const univInput = document.getElementById('universe');
                if (univInput) {
                    univInput.classList.add('is-invalid');
                    univInput.focus();
                }
                if (resultContainer) resultContainer.innerHTML = `<span class='text-danger'>Universe must be provided for complement operation</span>`;
                return;
            }
            const payload = {operation: op, setA, setB, universe};
            const data = await setTheoryApi(payload);
            if (data.error) throw new Error(data.error);
            renderLatexSet(data.result, resultContainer);
            if (data.steps) renderExplanation(data.steps, explanationContainer);
            if (vennContainer && (op === 'union' || op === 'intersection' || op === 'difference' || op === 'symmetric')) {
                const sets = {A: setA, B: setB};
                await renderVennDiagram(sets, vennContainer);
            }
            DMC.showSuccess('Set operation completed');
        } catch (e) {
            resultContainer.innerHTML = `<span class='text-danger'>${e.message}</span>`;
            if (explanationContainer) explanationContainer.innerHTML = '';
            if (vennContainer) vennContainer.innerHTML = '';
            DMC.showError(e.message);
        }
    }
    // --- Batch processing ---
    async function runBatchOperations(ops, container) {
        try {
            const data = await setTheoryApi({action:'batch',operations:ops});
            if (data.error) throw new Error(data.error);
            let html = '<table class="table table-bordered table-sm"><thead><tr><th>Operation</th><th>Result</th><th>Steps</th></tr></thead><tbody>';
            for (const r of data.results) {
                html += `<tr><td>${r.operation||''}</td><td>${JSON.stringify(r.result)}</td><td>${(r.steps||[]).join('<br>')}</td></tr>`;
            }
            html += '</tbody></table>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = `<span class='text-danger'>${e.message}</span>`;
        }
    }
    // --- Relation operations ---
    async function runRelationOperation(op, relation, universe, container) {
        try {
            const payload = {operation: op, relation, universe};
            const data = await setTheoryApi(payload);
            DMC.showError(e.message);
        }catch (e) {
        DMC.showError(e.message);
    }
    }
    function renderLatexSet(set, container) {
        if (!container) return;
        let latex = '';
        if (Array.isArray(set)) latex = '\\{' + set.join(', ') + '\\}';
        else if (typeof set === 'object' && set !== null) latex = JSON.stringify(set);
        else latex = String(set);
        container.innerHTML = `$$${latex}$$`;
        if (window.MathJax) MathJax.typesetPromise([container]);
    }
    function renderExplanation(steps, container) {
        if (!container) return;
        container.innerHTML = steps.map(s => `<div class='step'>${s}</div>`).join('');
    }
    async function renderVennDiagram(sets, container) {
        if (!container) return;
        try {
            const resp = await fetch('/api/probability/venn', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sets})
            });
            const data = await resp.json();
            if (data.image) {
                container.innerHTML = `<img src='data:image/png;base64,${data.image}' alt='Venn diagram' style='max-width:100%;max-height:300px;' />`;
            } else {
                container.innerHTML = '<span class="text-danger">Venn diagram unavailable</span>';
            }
        } catch {
            container.innerHTML = '<span class="text-danger">Venn diagram error</span>';
        }
    }
    let setHistory = [];
    function addToHistory(entry) {
        setHistory.unshift(entry);
        if (setHistory.length > 20) setHistory.pop();
        renderHistoryPanel();
    }
    function renderHistoryPanel() {
        let container = document.querySelector('.container');
        if (!container) return;

        let panel = document.getElementById('setHistoryPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'setHistoryPanel';
            panel.className = 'card shadow-sm p-3 mb-3';
            panel.innerHTML = '<h5>History</h5><div id="setHistoryList"></div>';
            container.insertBefore(panel, container.firstChild);
        }
        
        let list = panel.querySelector('#setHistoryList');
        if (!list) {
            list = document.createElement('div');
            list.id = 'setHistoryList';
            panel.appendChild(list);
        }
        list.innerHTML = setHistory.map((h,i) => `<div class='mb-2'><b>${h.op}</b>: ${JSON.stringify(h.result)} <button class='btn btn-link btn-sm' onclick='restoreHistory(${i})'>Restore</button></div>`).join('');
    }
    window.restoreHistory = function(idx) {
        const h = setHistory[idx];
        if (!h) return;
        document.getElementById('setA').value = h.setA;
        document.getElementById('setB').value = h.setB;
        document.getElementById('universe').value = h.universe;
    }
    // --- Set Operations Form ---
    const setOpForm = document.getElementById('setOperationsForm');
    if (setOpForm) {
        setOpForm.querySelectorAll('[data-operation]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const op = btn.dataset.operation;
                const setA = setOpForm.setA.value;
                const setB = setOpForm.setB.value;
                const universe = setOpForm.universe.value;
                const resultDiv = setOpForm.querySelector('.math-display');
                const vennDiv = document.getElementById('vennDiagram');
                let explanationDiv = setOpForm.querySelector('.explanation-box');
                const resultContainer = setOpForm.querySelector('.result-container');
                if (resultContainer) resultContainer.classList.remove('visually-hidden');
                if (!explanationDiv) {
                    explanationDiv = document.createElement('div');
                    explanationDiv.className = 'explanation-box';
                    resultDiv.parentNode.appendChild(explanationDiv);
                }
                await runSetOperation(op, setA, setB, universe, resultDiv, vennDiv, explanationDiv);
                addToHistory({op, setA, setB, universe, result: resultDiv.textContent});
            });
        });
    } else {
        console.warn('setOperationsForm not found');
    }
    // --- Set Properties ---
    const setPropForm = document.getElementById('setPropertiesForm');
    if (setPropForm) {
        setPropForm.querySelectorAll('[data-property]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const op = btn.dataset.property;
                const setA = setPropForm.setC.value;
                const resultDiv = setPropForm.querySelector('.math-display');
                let explanationDiv = setPropForm.querySelector('.explanation-box');
                const resultContainer = setPropForm.querySelector('.result-container');
                if (resultContainer) resultContainer.classList.remove('visually-hidden');
                if (!explanationDiv) {
                    explanationDiv = document.createElement('div');
                    explanationDiv.className = 'explanation-box';
                    resultDiv.parentNode.appendChild(explanationDiv);
                }
                await runSetOperation(op, setA, '', '', resultDiv, null, explanationDiv);
                addToHistory({op, setA, result: resultDiv.textContent});
            });
        });
    } else {
        console.warn('setPropertiesForm not found');
    }
    // --- Set Relations ---
    const setRelForm = document.getElementById('setRelationsForm');
    if (setRelForm) {
        setRelForm.querySelectorAll('[data-relation]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const op = btn.dataset.relation;
                const setA = setRelForm.setD.value;
                const setB = setRelForm.setE.value;
                const resultDiv = setRelForm.querySelector('.math-display');
                let explanationDiv = setRelForm.querySelector('.explanation-box');
                const resultContainer = setRelForm.querySelector('.result-container');
                if (resultContainer) resultContainer.classList.remove('visually-hidden');
                if (!explanationDiv) {
                    explanationDiv = document.createElement('div');
                    explanationDiv.className = 'explanation-box';
                    resultDiv.parentNode.appendChild(explanationDiv);
                }
                await runRelationOperation(op, setA, setB, resultDiv);
                addToHistory({op, setA, setB, result: resultDiv.textContent});
            });
        });
    } else {
        console.warn('setRelationsForm not found');
    }
    // --- Batch Processing ---
    let batchPanel = document.getElementById('setBatchPanel');
    if (batchPanel) {
        const runBatchBtn = document.getElementById('runBatchBtn');
        if (runBatchBtn) {
            runBatchBtn.onclick = function() {
                let ops;
                try { ops = JSON.parse(document.getElementById('batchOpsInput').value); } catch { DMC.showError('Invalid JSON'); return; }
                runBatchOperations(ops, document.getElementById('batchResult'));
            };
        }
    }
    // --- Reset Buttons ---
    document.querySelectorAll('.reset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const form = document.getElementById(this.dataset.reset);
            if (form) {
                form.reset();
                const c = form.querySelector('.result-container');
                if (c) {
                    c.classList.add('visually-hidden');
                    c.classList.remove('result-highlight');
                }
                form.querySelectorAll('.active').forEach(b => b.classList.remove('active', 'btn-outline-dark'));
            }
        });
    });
    // --- ARIA/Accessibility ---
    document.querySelectorAll('input,button').forEach(el => {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        if (!el.hasAttribute('aria-label') && el.title) el.setAttribute('aria-label', el.title);
    });
    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            if (setHistory.length > 1) {
                setHistory.shift();
                renderHistoryPanel();
            }
        }
    });
    // --- Live validation and suggestions ---
    function parseAdvancedSetInput(str) {
        str = str.trim();
        if (/^\{.*\|.*\}$/.test(str)) return {type: 'set-builder', valid: true};
        if (/^\d+\.\.(\d+)$/.test(str)) return {type: 'range', valid: true};
        if (/^\{.*\(.*\,.*\).*\}$/.test(str)) return {type: 'fuzzy', valid: true};
        if (/^N$|^Z$|^Q$|^R$|^C$|^ℕ$|^ℤ$|^ℚ$|^ℝ$|^ℂ$/.test(str)) return {type: 'infinite', valid: true};
        if (/^\{.*\}$/.test(str)) return {type: 'multiset', valid: true};
        if (/^[^,\s]+(,[^,\s]+)*$/.test(str)) return {type: 'plain', valid: true};
        return {type: 'unknown', valid: false};
    }
    function validateSetInput(input) {
        const res = parseAdvancedSetInput(input.value);
        if (!res.valid) {
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            input.title = 'Unrecognized set format';
        } else {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            input.title = '';
        }
    }
    document.querySelectorAll('#setOperationsForm input, #setPropertiesForm input, #setRelationsForm input').forEach(inp => {
        inp.addEventListener('input', function() { validateSetInput(this); });
    });
    // --- Initial render ---
    renderNamedSidebar();
    addSaveButtons();
    renderHistoryPanel();
});

