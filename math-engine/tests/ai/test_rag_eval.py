from dmc_ai.rag.eval import check_precision_gate, evaluate_precision_at_k, load_eval_cases
from dmc_ai.rag.pipeline import get_rag_pipeline


def test_rag_eval_cases_file_is_loadable():
    cases = load_eval_cases()

    assert isinstance(cases, list)
    assert len(cases) >= 4
    assert all('query' in c for c in cases)


def test_rag_precision_at_k_eval_returns_expected_score():
    pipeline = get_rag_pipeline()
    cases = load_eval_cases()

    report = evaluate_precision_at_k(pipeline, cases, k=1)

    assert report['cases_count'] >= 4
    assert report['k'] == 1
    assert report['average_precision_at_k'] >= 0.66
    assert all('precision_at_k' in c for c in report['cases'])


def test_rag_eval_quality_gate_threshold_check():
    report = {'average_precision_at_k': 0.8}

    assert check_precision_gate(report, 0.7) is True
    assert check_precision_gate(report, 0.8) is True
    assert check_precision_gate(report, 0.9) is False
    assert check_precision_gate(report, None) is True
