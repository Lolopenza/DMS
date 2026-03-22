import base64
import io

import matplotlib.pyplot as plt
import numpy as np
import sympy as sp
from scipy.stats import binom, poisson, geom, hypergeom, nbinom
from matplotlib_venn import venn2, venn3

from fastapi import APIRouter, HTTPException
from schemas.discrete_math.probability import (
    ProbabilityRequest, HypergeometricRequest, NegativeBinomialRequest,
    JointProbabilityRequest, CustomPMFRequest, StepByStepRequest,
    VennRequest, SimulateRequest,
)

router = APIRouter(prefix='/api/v1/probability', tags=['Probability'])


def _require(value, name: str):
    if value is None:
        raise HTTPException(400, f'{name} is required')
    return value


def _prob(value, name: str):
    value = _require(value, name)
    if value < 0 or value > 1:
        raise HTTPException(400, f'{name} must be in [0, 1]')
    return float(value)


@router.post('/')
def probability_calculate(req: ProbabilityRequest):
    op = req.operation

    if op == 'simple':
        total = _require(req.total, 'total')
        favorable = _require(req.favorable, 'favorable')
        if total <= 0 or favorable < 0 or favorable > total:
            raise HTTPException(400, 'Check input values')
        result = favorable / total
        steps = f'P = {favorable} / {total} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'union':
        p_a = _prob(req.pA, 'pA')
        p_b = _prob(req.pB, 'pB')
        p_a_and_b = _prob(req.pAandB, 'pAandB')
        result = p_a + p_b - p_a_and_b
        if result < 0 or result > 1:
            raise HTTPException(400, 'P(A ∪ B) must be in [0, 1], check inputs')
        steps = f'P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = {p_a} + {p_b} - {p_a_and_b} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'complement':
        p_event = _prob(req.pEvent, 'pEvent')
        result = 1 - p_event
        steps = f"P(A') = 1 - P(A) = 1 - {p_event} = {result}"
        return {'result': result, 'steps': steps}

    if op == 'independence_check':
        p_a = _prob(req.pA, 'pA')
        p_b = _prob(req.pB, 'pB')
        p_a_and_b = _prob(req.pAandB, 'pAandB')
        expected = p_a * p_b
        independent = abs(p_a_and_b - expected) < 1e-10
        return {
            'result': independent,
            'expected_joint': expected,
            'actual_joint': p_a_and_b,
            'steps': f'Independent iff P(A ∩ B) = P(A)P(B). Compare {p_a_and_b} with {expected}',
        }

    if op == 'conditional':
        condition = _require(req.condition, 'condition')
        joint = _require(req.joint, 'joint')
        if condition <= 0 or joint < 0 or joint > condition:
            raise HTTPException(400, 'Check input values')
        result = joint / condition
        steps = f'P(A|B) = {joint} / {condition} = {result}'
        return {'result': result, 'steps': steps}

    if op == 'total_probability':
        priors = _require(req.priors, 'priors')
        likelihoods = _require(req.likelihoods, 'likelihoods')
        if len(priors) != len(likelihoods) or len(priors) == 0:
            raise HTTPException(400, 'priors and likelihoods must have equal non-zero length')
        if any(p < 0 or p > 1 for p in priors) or any(l < 0 or l > 1 for l in likelihoods):
            raise HTTPException(400, 'All priors and likelihoods must be in [0, 1]')
        sum_priors = float(sum(priors))
        if abs(sum_priors - 1.0) > 1e-8:
            raise HTTPException(400, 'priors must sum to 1')
        result = float(sum(p * l for p, l in zip(priors, likelihoods)))
        return {'result': result, 'steps': 'P(B) = Σ P(B|A_i)P(A_i)'}

    if op == 'bayes':
        prior = _prob(req.prior, 'prior')
        true_pos = _prob(req.true_pos, 'true_pos')
        false_pos = _prob(req.false_pos, 'false_pos')
        denom = (true_pos * prior) + (false_pos * (1 - prior))
        if denom == 0:
            raise HTTPException(400, 'Denominator cannot be zero')
        result = (true_pos * prior) / denom
        steps = f'P(A|B) = ({true_pos} * {prior}) / {denom} = {result}'
        return {
            'result': result,
            'denominator': denom,
            'false_alarm_contribution': false_pos * (1 - prior),
            'steps': steps,
        }

    if op == 'binomial_pmf':
        n = _require(req.n, 'n')
        p = _prob(req.p, 'p')
        k = _require(req.k, 'k')
        if n < 0 or k < 0 or k > n:
            raise HTTPException(400, 'Require n >= 0 and 0 <= k <= n')
        comb = sp.binomial(req.n, req.k)
        prob = comb * (p ** k) * ((1 - p) ** (n - k))
        steps = f'P(X={k}) = C({n},{k}) * {p}^{k} * (1-{p})^{n - k} = {prob}'
        return {'result': float(prob), 'steps': steps}

    if op == 'poisson_pmf':
        lam = _require(req.lambda_, 'lambda_')
        k = _require(req.k, 'k')
        if lam < 0 or k < 0:
            raise HTTPException(400, 'Require lambda_ >= 0 and k >= 0')
        prob = poisson.pmf(k, lam)
        steps = f'P(X={k}) = e^(-{lam}) * {lam}^{k} / {k}! = {prob}'
        return {'result': float(prob), 'steps': steps}

    if op == 'geometric_pmf':
        p = _prob(req.p, 'p')
        k = _require(req.k, 'k')
        if k < 1:
            raise HTTPException(400, 'k must be >= 1 for geometric distribution')
        prob = geom.pmf(k, p)
        steps = f'P(X={k}) = (1-{p})^{k - 1} * {p} = {prob}'
        return {'result': float(prob), 'steps': steps}

    if op == 'distribution_summary':
        dist = str(_require(req.dist, 'dist')).strip().lower()
        if dist == 'binomial':
            n = _require(req.n, 'n')
            p = _prob(req.p, 'p')
            if n < 0:
                raise HTTPException(400, 'n must be >= 0')
            summary = {'mean': n * p, 'variance': n * p * (1 - p)}
            if req.k is not None:
                if req.k < 0 or req.k > n:
                    raise HTTPException(400, 'For PMF, k must satisfy 0 <= k <= n')
                summary['pmf_at_k'] = float(binom.pmf(req.k, n, p))
            return {'result': summary, 'steps': 'Binomial: mean=np, variance=np(1-p)'}

        if dist == 'poisson':
            lam = _require(req.lambda_, 'lambda_')
            if lam < 0:
                raise HTTPException(400, 'lambda_ must be >= 0')
            summary = {'mean': lam, 'variance': lam}
            if req.k is not None:
                if req.k < 0:
                    raise HTTPException(400, 'For PMF, k must be >= 0')
                summary['pmf_at_k'] = float(poisson.pmf(req.k, lam))
            return {'result': summary, 'steps': 'Poisson: mean=λ, variance=λ'}

        if dist == 'geometric':
            p = _prob(req.p, 'p')
            summary = {'mean': 1 / p, 'variance': (1 - p) / (p ** 2)}
            if req.k is not None:
                if req.k < 1:
                    raise HTTPException(400, 'For PMF, k must be >= 1')
                summary['pmf_at_k'] = float(geom.pmf(req.k, p))
            return {'result': summary, 'steps': 'Geometric: mean=1/p, variance=(1-p)/p^2'}

        raise HTTPException(400, f'Unknown distribution for summary: {dist}')

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
