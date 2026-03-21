import argparse
import json
from pathlib import Path
from typing import Any, Dict, List

from .pipeline import RagPipeline, get_rag_pipeline


EvalCase = Dict[str, Any]
DEFAULT_CASES_FILE = Path(__file__).with_name('eval_cases.json')


def precision_at_k_for_case(hits: List[Dict[str, Any]], relevant_doc_ids: List[str], k: int) -> float:
    if k <= 0:
        return 0.0
    top = hits[:k]
    if not top:
        return 0.0

    relevant = set(relevant_doc_ids)
    if not relevant:
        return 0.0

    tp = sum(1 for hit in top if hit.get('id') in relevant)
    return tp / len(top)


def evaluate_precision_at_k(
    pipeline: RagPipeline,
    cases: List[EvalCase],
    k: int = 3,
) -> Dict[str, Any]:
    per_case: List[Dict[str, Any]] = []

    for case in cases:
        query = case.get('query', '')
        subject = case.get('subject')
        module = case.get('module')
        relevant = case.get('relevant_doc_ids', [])

        hits = pipeline.retrieve(query, top_k=k, subject=subject, module=module)
        score = precision_at_k_for_case(hits, relevant, k)

        per_case.append(
            {
                'query': query,
                'subject': subject,
                'module': module,
                'precision_at_k': round(score, 4),
                'hit_ids': [h.get('id') for h in hits],
                'relevant_doc_ids': list(relevant),
            }
        )

    avg = 0.0
    if per_case:
        avg = sum(c['precision_at_k'] for c in per_case) / len(per_case)

    return {
        'k': k,
        'cases_count': len(per_case),
        'average_precision_at_k': round(avg, 4),
        'cases': per_case,
    }


def load_eval_cases(cases_file: str | None = None) -> List[EvalCase]:
    path = Path(cases_file) if cases_file else DEFAULT_CASES_FILE
    raw = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(raw, list):
        raise ValueError('Eval cases file must contain a JSON list')
    return raw


def run_default_eval(
    k: int = 3,
    cases_file: str | None = None,
    output_file: str | None = None,
) -> Dict[str, Any]:
    cases = load_eval_cases(cases_file)
    pipeline = get_rag_pipeline()
    report = evaluate_precision_at_k(pipeline, cases, k=k)

    if output_file:
        out_path = Path(output_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

    return report


def check_precision_gate(report: Dict[str, Any], min_precision: float | None) -> bool:
    if min_precision is None:
        return True
    return float(report.get('average_precision_at_k', 0.0)) >= float(min_precision)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Run RAG precision@k evaluation')
    parser.add_argument('--k', type=int, default=3, help='Top-K for precision@k')
    parser.add_argument('--cases', type=str, default=None, help='Path to eval cases JSON')
    parser.add_argument('--output', type=str, default=None, help='Optional output JSON report path')
    parser.add_argument('--min-precision', type=float, default=None, help='Fail with non-zero exit code if average_precision_at_k is lower')
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    report = run_default_eval(k=args.k, cases_file=args.cases, output_file=args.output)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not check_precision_gate(report, args.min_precision):
        avg = report.get('average_precision_at_k', 0.0)
        print(
            f"RAG eval quality gate failed: average_precision_at_k={avg} < min_precision={args.min_precision}",
            flush=True,
        )
        raise SystemExit(2)


if __name__ == '__main__':
    main()
