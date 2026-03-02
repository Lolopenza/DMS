import base64
import io

import matplotlib.pyplot as plt
import numpy as np
import sympy as sp
from scipy.stats import binom, poisson, geom, hypergeom, nbinom
from matplotlib_venn import venn2, venn3

from fastapi import APIRouter, HTTPException
from schemas.probability_schemas import (
    ProbabilityRequest, HypergeometricRequest, NegativeBinomialRequest,
    JointProbabilityRequest, CustomPMFRequest, StepByStepRequest,
    VennRequest, SimulateRequest,
)

router = APIRouter(prefix='/api/v1/probability', tags=['Probability'])


@router.post('/')
def probability_calculate(req: ProbabilityRequest):
    op = req.operation

    if op == 'simple':
        if req.total <= 0 or req.favorable < 0 or req.favorable > req.total:
            raise HTTPException(400, 'Check input values')
        result = req.favorable / req.total
        steps = f'P = {req.favorable} / {req.total} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'conditional':
        if req.condition <= 0 or req.joint < 0 or req.joint > req.condition:
            raise HTTPException(400, 'Check input values')
        result = req.joint / req.condition
        steps = f'P(A|B) = {req.joint} / {req.condition} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'bayes':
        denom = (req.true_pos * req.prior) + (req.false_pos * (1 - req.prior))
        if denom == 0:
            raise HTTPException(400, 'Denominator cannot be zero')
        result = (req.true_pos * req.prior) / denom
        steps = f'P(A|B) = ({req.true_pos} * {req.prior}) / {denom} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'binomial_pmf':
        comb = sp.binomial(req.n, req.k)
        prob = comb * (req.p ** req.k) * ((1 - req.p) ** (req.n - req.k))
        steps = f'P(X={req.k}) = C({req.n},{req.k}) * {req.p}^{req.k} * (1-{req.p})^{req.n - req.k} = {prob}'
        return {'result': float(prob), 'steps': steps}

    if op == 'poisson_pmf':
        lam = req.lambda_
        prob = poisson.pmf(req.k, lam)
        steps = f'P(X={req.k}) = e^(-{lam}) * {lam}^{req.k} / {req.k}! = {prob}'
        return {'result': float(prob), 'steps': steps}

    if op == 'geometric_pmf':
        prob = geom.pmf(req.k, req.p)
        steps = f'P(X={req.k}) = (1-{req.p})^{req.k - 1} * {req.p} = {prob}'
        return {'result': float(prob), 'steps': steps}

    raise HTTPException(400, f'Unknown operation: {op}')


@router.post('/hypergeometric')
def probability_hypergeometric(req: HypergeometricRequest):
    result = float(hypergeom.pmf(req.k, req.M, req.n, req.N))
    steps = f'Hypergeometric PMF: P(X={req.k}) = C(n,{req.k})*C(M-n,N-k)/C(M,N)'
    return {'result': result, 'steps': steps}


@router.post('/negative_binomial')
def probability_negative_binomial(req: NegativeBinomialRequest):
    result = float(nbinom.pmf(req.k, req.n, req.p))
    steps = f'Negative Binomial PMF: P(X={req.k}) = nbinom.pmf({req.k}, n={req.n}, p={req.p})'
    return {'result': result, 'steps': steps}


@router.post('/joint')
def probability_joint(req: JointProbabilityRequest):
    if not all(0 <= p <= 1 for p in req.probs):
        raise HTTPException(400, 'All probabilities must be between 0 and 1')
    result = 1.0
    for p in req.probs:
        result *= p
    return {'result': result, 'steps': 'Joint probability (independent): product of all probabilities'}


@router.post('/custom_pmf')
def probability_custom_pmf(req: CustomPMFRequest):
    if len(req.values) != len(req.probs):
        raise HTTPException(400, 'values and probs must have the same length')
    pmf = dict(zip(req.values, req.probs))
    mean = sum(float(v) * float(p) for v, p in zip(req.values, req.probs))
    var = sum((float(v) - mean) ** 2 * float(p) for v, p in zip(req.values, req.probs))
    return {'pmf': pmf, 'mean': mean, 'variance': var, 'steps': 'Mean = sum(v*p), Variance = sum((v-mean)^2*p)'}


@router.post('/step_by_step')
def probability_step_by_step(req: StepByStepRequest):
    if req.operation == 'binomial_pmf':
        n = int(req.params['n'])
        p = float(req.params['p'])
        k = int(req.params['k'])
        comb = sp.binomial(n, k)
        prob = comb * (p ** k) * ((1 - p) ** (n - k))
        steps = f'P(X={k}) = C({n},{k}) * {p}^{k} * (1-{p})^{n-k} = {prob}'
        return {'result': float(prob), 'steps': steps}
    raise HTTPException(400, f'Unknown operation: {req.operation}')


def _img_to_base64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')


def _fmt_elements(elements, max_display=10) -> str:
    lst = sorted(str(e) for e in elements)
    if len(lst) > max_display:
        return ', '.join(lst[:max_display]) + f'\n... (+{len(lst) - max_display} more)'
    return ', '.join(lst)


@router.post('/venn')
def probability_venn(req: VennRequest):
    sets = req.sets
    if len(sets) not in (2, 3):
        raise HTTPException(400, 'Provide 2 or 3 sets')
    set_objs = {k: set(v) for k, v in sets.items()}
    keys = list(sets.keys())
    fig, ax = plt.subplots(figsize=(10, 8))
    if len(sets) == 2:
        v = venn2([set_objs[keys[0]], set_objs[keys[1]]], set_labels=(keys[0], keys[1]), ax=ax)
        A_only = set_objs[keys[0]] - set_objs[keys[1]]
        B_only = set_objs[keys[1]] - set_objs[keys[0]]
        inter = set_objs[keys[0]] & set_objs[keys[1]]
        for label_id, elems in [('10', A_only), ('01', B_only), ('11', inter)]:
            lbl = v.get_label_by_id(label_id)
            if lbl:
                lbl.set_text(_fmt_elements(elems))
    else:
        A, B, C = set_objs[keys[0]], set_objs[keys[1]], set_objs[keys[2]]
        v = venn3([A, B, C], set_labels=(keys[0], keys[1], keys[2]), ax=ax)
        regions = {
            '100': A - B - C, '010': B - A - C, '001': C - A - B,
            '110': (A & B) - C, '101': (A & C) - B, '011': (B & C) - A, '111': A & B & C,
        }
        for label_id, elems in regions.items():
            lbl = v.get_label_by_id(label_id)
            if lbl:
                lbl.set_text(_fmt_elements(elems, max_display=8))
    ax.set_title('Venn Diagram', fontsize=14, fontweight='bold')
    plt.tight_layout()
    return {'image': _img_to_base64(fig)}


@router.post('/simulate')
def probability_simulate(req: SimulateRequest):
    dist = req.distribution
    params = req.params
    trials = req.trials

    if dist == 'binomial':
        samples = binom.rvs(int(params['n']), float(params['p']), size=trials)
    elif dist == 'poisson':
        samples = poisson.rvs(float(params['lambda']), size=trials)
    elif dist == 'geometric':
        samples = geom.rvs(float(params['p']), size=trials)
    elif dist == 'custom':
        samples = np.random.choice(params['values'], size=trials, p=params['probs'])
    else:
        raise HTTPException(400, f'Unknown distribution: {dist}')

    fig, ax = plt.subplots()
    ax.hist(samples, bins=range(int(min(samples)), int(max(samples)) + 2), density=True, alpha=0.7, color='skyblue')
    ax.set_title(f'Simulation ({dist}, {trials} trials)')
    return {'samples': samples.tolist(), 'image': _img_to_base64(fig)}
