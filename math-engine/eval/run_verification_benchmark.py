#!/usr/bin/env python3
"""
Hybrid verification benchmark for thesis evaluation.

Compares system verdict (verify_answer) against ground-truth labels in
eval/verification_benchmark.json.

Usage (from math-engine/):
  .venv\\Scripts\\python.exe eval/run_verification_benchmark.py
  .venv\\Scripts\\python.exe eval/run_verification_benchmark.py --live
  .venv\\Scripts\\python.exe eval/run_verification_benchmark.py --live --output eval/reports

Modes:
  default   — skips cases with requiresLiveLlm; uses llmMock / forceLlmError
  --live    — also runs requiresLiveLlm cases against real Gemini/Groq
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Bootstrap imports like app.py
_ENGINE_DIR = Path(__file__).resolve().parents[1]
_REPO_ROOT = _ENGINE_DIR.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))
if str(_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(_ENGINE_DIR))

from dotenv import load_dotenv

load_dotenv(_REPO_ROOT / '.env')
load_dotenv(_ENGINE_DIR / '.env', override=True)

import api.v1.problem_generation as pg  # noqa: E402
from api.v1.problem_generation import VerifyRequest, verify_answer  # noqa: E402


@dataclass
class CaseResult:
    case_id: str
    category: str
    label: str
    ground_truth: bool
    system_correct: bool
    match: bool
    method: str
    confidence: Optional[float]
    feedback: str
    notes: str
    false_positive: bool
    false_negative: bool


class _MockChatbot:
    def __init__(self, reply: Optional[Dict[str, str]] = None, error: Optional[str] = None):
        self._reply = reply
        self._error = error

    def chat(self, *_args, **_kwargs):
        if self._error:
            return {'error': self._error}
        if self._reply:
            return self._reply
        return {'error': 'mock llm unavailable'}


def _load_benchmark(path: Path) -> List[Dict[str, Any]]:
    data = json.loads(path.read_text(encoding='utf-8'))
    return list(data.get('cases') or [])


def _run_case(case: Dict[str, Any], live: bool) -> CaseResult:
    requires_live = bool(case.get('requiresLiveLlm'))
    if requires_live and not live:
        return CaseResult(
            case_id=case['id'],
            category=case.get('category', ''),
            label=case.get('label', ''),
            ground_truth=bool(case['groundTruthCorrect']),
            system_correct=False,
            match=False,
            method='skipped',
            confidence=None,
            feedback='Skipped (requires --live)',
            notes=case.get('notes', ''),
            false_positive=False,
            false_negative=False,
        )

    mock_reply = case.get('llmMock')
    force_error = bool(case.get('forceLlmError'))

    original_get = pg.get_chatbot_service
    try:
        if mock_reply or force_error:
            chatbot = _MockChatbot(
                reply=mock_reply if mock_reply else None,
                error='timeout' if force_error else None,
            )
            pg.get_chatbot_service = lambda: chatbot  # type: ignore[assignment]

        req = VerifyRequest(**case['request'])
        payload = verify_answer(req)
    except Exception as exc:
        return CaseResult(
            case_id=case['id'],
            category=case.get('category', ''),
            label=case.get('label', ''),
            ground_truth=bool(case['groundTruthCorrect']),
            system_correct=False,
            match=False,
            method='error',
            confidence=None,
            feedback=str(exc)[:200],
            notes=case.get('notes', ''),
            false_positive=False,
            false_negative=bool(case['groundTruthCorrect']),
        )
    finally:
        pg.get_chatbot_service = original_get

    ground = bool(case['groundTruthCorrect'])
    system = bool(payload.get('correct'))
    match = ground == system
    fp = (not ground) and system
    fn = ground and (not system)

    return CaseResult(
        case_id=case['id'],
        category=case.get('category', ''),
        label=case.get('label', ''),
        ground_truth=ground,
        system_correct=system,
        match=match,
        method=str(payload.get('method', '')),
        confidence=float(payload['confidence']) if payload.get('confidence') is not None else None,
        feedback=str(payload.get('feedback', ''))[:200],
        notes=case.get('notes', ''),
        false_positive=fp,
        false_negative=fn,
    )


def _aggregate(results: List[CaseResult]) -> Dict[str, Any]:
    evaluated = [r for r in results if r.method != 'skipped']
    skipped = [r for r in results if r.method == 'skipped']
    n = len(evaluated)
    matches = sum(1 for r in evaluated if r.match)
    fp = sum(1 for r in evaluated if r.false_positive)
    fn = sum(1 for r in evaluated if r.false_negative)
    tn = sum(1 for r in evaluated if (not r.ground_truth) and (not r.system_correct))
    tp = sum(1 for r in evaluated if r.ground_truth and r.system_correct)

    by_method: Dict[str, List[CaseResult]] = defaultdict(list)
    by_category: Dict[str, List[CaseResult]] = defaultdict(list)
    for r in evaluated:
        by_method[r.method].append(r)
        by_category[r.category].append(r)

    method_stats = {}
    for method, rows in sorted(by_method.items()):
        m = sum(1 for r in rows if r.match)
        method_stats[method] = {
            'count': len(rows),
            'accuracy': round(m / len(rows), 4) if rows else 0.0,
            'false_positive': sum(1 for r in rows if r.false_positive),
            'false_negative': sum(1 for r in rows if r.false_negative),
        }

    category_stats = {}
    for cat, rows in sorted(by_category.items()):
        m = sum(1 for r in rows if r.match)
        category_stats[cat] = {
            'count': len(rows),
            'accuracy': round(m / len(rows), 4) if rows else 0.0,
        }

    confidences = [r.confidence for r in evaluated if r.confidence is not None]
    avg_conf = round(sum(confidences) / len(confidences), 4) if confidences else None

    low_conf_review = [
        r for r in evaluated
        if r.confidence is not None and r.confidence < 0.55 and r.method.startswith(('semantic', 'code-judge', 'math-judge'))
    ]

    return {
        'total_cases': len(results),
        'evaluated': n,
        'skipped': len(skipped),
        'matches': matches,
        'accuracy': round(matches / n, 4) if n else 0.0,
        'true_positive': tp,
        'true_negative': tn,
        'false_positive': fp,
        'false_negative': fn,
        'precision': round(tp / (tp + fp), 4) if (tp + fp) else None,
        'recall': round(tp / (tp + fn), 4) if (tp + fn) else None,
        'avg_confidence': avg_conf,
        'by_method': method_stats,
        'by_category': category_stats,
        'manual_review_candidates': [
            {
                'id': r.case_id,
                'label': r.label,
                'method': r.method,
                'confidence': r.confidence,
                'ground_truth': r.ground_truth,
                'system_correct': r.system_correct,
            }
            for r in low_conf_review
        ],
        'errors': [
            {
                'id': r.case_id,
                'label': r.label,
                'category': r.category,
                'method': r.method,
                'ground_truth': r.ground_truth,
                'system_correct': r.system_correct,
                'type': 'false_positive' if r.false_positive else 'false_negative',
                'feedback': r.feedback,
                'notes': r.notes,
            }
            for r in evaluated
            if not r.match
        ],
    }


def _write_csv(path: Path, results: List[CaseResult]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow([
            'case_id', 'category', 'label', 'ground_truth', 'system_correct',
            'match', 'method', 'confidence', 'false_positive', 'false_negative',
            'feedback', 'notes',
        ])
        for r in results:
            w.writerow([
                r.case_id, r.category, r.label, r.ground_truth, r.system_correct,
                r.match, r.method, r.confidence, r.false_positive, r.false_negative,
                r.feedback, r.notes,
            ])


def _write_markdown(path: Path, summary: Dict[str, Any], results: List[CaseResult], live: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    lines = [
        '# Hybrid Verification Benchmark Report',
        '',
        f'- Generated: {ts}',
        f'- Mode: {"live LLM included" if live else "deterministic + mocked LLM (no requiresLiveLlm)"}',
        f'- Benchmark: `eval/verification_benchmark.json`',
        '',
        '## Summary',
        '',
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Total cases | {summary['total_cases']} |",
        f"| Evaluated | {summary['evaluated']} |",
        f"| Skipped | {summary['skipped']} |",
        f"| Accuracy (match with ground truth) | **{summary['accuracy']:.1%}** |",
        f"| True positive | {summary['true_positive']} |",
        f"| True negative | {summary['true_negative']} |",
        f"| False positive (accepted wrong) | {summary['false_positive']} |",
        f"| False negative (rejected correct) | {summary['false_negative']} |",
    ]
    if summary.get('precision') is not None:
        lines.append(f"| Precision | {summary['precision']:.1%} |")
    if summary.get('recall') is not None:
        lines.append(f"| Recall | {summary['recall']:.1%} |")
    if summary.get('avg_confidence') is not None:
        lines.append(f"| Mean confidence (evaluated) | {summary['avg_confidence']} |")

    lines.extend(['', '## By verification_method', '', '| Method | N | Accuracy | FP | FN |'])
    for method, st in summary['by_method'].items():
        lines.append(
            f"| {method} | {st['count']} | {st['accuracy']:.1%} | {st['false_positive']} | {st['false_negative']} |"
        )

    lines.extend(['', '## By category', '', '| Category | N | Accuracy |'])
    for cat, st in summary['by_category'].items():
        lines.append(f"| {cat} | {st['count']} | {st['accuracy']:.1%} |")

    if summary['errors']:
        lines.extend(['', '## Mismatches (system vs ground truth)', ''])
        for err in summary['errors']:
            lines.append(
                f"- **{err['id']}** ({err['type']}, `{err['method']}`): "
                f"ground={err['ground_truth']}, system={err['system_correct']} — {err['label']}"
            )
            if err.get('notes'):
                lines.append(f"  - Note: {err['notes']}")
            if err.get('feedback'):
                lines.append(f"  - Feedback: {err['feedback'][:120]}")

    if summary['manual_review_candidates']:
        lines.extend(['', '## Manual teacher review candidates (confidence < 0.55)', ''])
        for item in summary['manual_review_candidates']:
            lines.append(
                f"- {item['id']}: {item['label']} — method={item['method']}, confidence={item['confidence']}"
            )

    lines.extend(['', '## Interpretation notes for thesis', ''])
    lines.extend([
        '- **Symbolic** cases validate SymPy path (deterministic, high expected accuracy).',
        '- **semantic-fallback** cases validate behaviour when LLM is unavailable.',
        '- **semantic** with `--live` measures real Gemini/Groq judge quality (non-deterministic).',
        '- **code-judge** illustrates limits: no code execution; false positives possible.',
        '- Cases with `llmMock` false-positive simulate documented LLM failure modes for discussion.',
    ])

    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def _write_thesis_snippet(path: Path, summary: Dict[str, Any], live: bool) -> None:
    """Compact tables ready to paste into Word/LaTeX thesis chapter."""
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = 'deterministic + mocked LLM' if not live else 'full benchmark incl. live LLM'
    n = summary['evaluated']
    lines = [
        'Evaluation of Hybrid Answer Verification (Section B)',
        '',
        f'A benchmark of N = {n} labelled student answers was executed against the verify_answer '
        f'pipeline ({mode}). Ground-truth labels were assigned by the author (teacher reference). '
        f'Accuracy is defined as the fraction of cases where the system verdict (correct/incorrect) '
        f'matches the ground truth.',
        '',
        f'Table B.1 — Overall metrics (N = {n})',
        '',
        'Metric\tValue',
        f"Evaluated cases\t{n}",
        f"Matches with ground truth\t{summary['matches']}",
        f"Accuracy\t{summary['accuracy']:.1%}",
        f"False positive (accepted wrong)\t{summary['false_positive']}",
        f"False negative (rejected correct)\t{summary['false_negative']}",
    ]
    if summary.get('precision') is not None:
        lines.append(f"Precision\t{summary['precision']:.1%}")
    if summary.get('recall') is not None:
        lines.append(f"Recall\t{summary['recall']:.1%}")

    lines.extend(['', 'Table B.2 — Breakdown by verification_method', '', 'Method\tN\tAccuracy\tFP\tFN'])
    for method, st in summary['by_method'].items():
        lines.append(
            f"{method}\t{st['count']}\t{st['accuracy']:.1%}\t{st['false_positive']}\t{st['false_negative']}"
        )

    lines.extend(['', 'Table B.3 — Breakdown by answer category', '', 'Category\tN\tAccuracy'])
    for cat, st in summary['by_category'].items():
        lines.append(f"{cat}\t{st['count']}\t{st['accuracy']:.1%}")

    if summary['errors']:
        lines.extend(['', 'Table B.4 — Documented mismatches (illustrative LLM failure modes)', ''])
        lines.append('Case ID\tType\tMethod\tDescription')
        for err in summary['errors']:
            lines.append(
                f"{err['id']}\t{err['type']}\t{err['method']}\t{err['label'][:60]}"
            )

    if summary['manual_review_candidates']:
        lines.extend([
            '',
            'Table B.5 — Cases flagged for manual teacher review (confidence < 0.55)',
            '',
            'Case ID\tMethod\tConfidence\tGround truth\tSystem verdict',
        ])
        for item in summary['manual_review_candidates']:
            lines.append(
                f"{item['id']}\t{item['method']}\t{item['confidence']}\t"
                f"{item['ground_truth']}\t{item['system_correct']}"
            )

    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description='Run hybrid verification benchmark')
    parser.add_argument(
        '--benchmark',
        type=Path,
        default=_ENGINE_DIR / 'eval' / 'verification_benchmark.json',
        help='Path to benchmark JSON',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=_ENGINE_DIR / 'eval' / 'reports',
        help='Output directory for CSV and Markdown',
    )
    parser.add_argument(
        '--live',
        action='store_true',
        help='Include requiresLiveLlm cases (calls real Gemini/Groq)',
    )
    args = parser.parse_args()

    cases = _load_benchmark(args.benchmark)
    results = [_run_case(c, live=args.live) for c in cases]
    summary = _aggregate(results)

    stamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    suffix = 'live' if args.live else 'mock'
    csv_path = args.output / f'verification_benchmark_{suffix}_{stamp}.csv'
    md_path = args.output / f'verification_benchmark_{suffix}_{stamp}.md'
    json_path = args.output / f'verification_benchmark_{suffix}_{stamp}.json'
    thesis_path = args.output / f'thesis_tables_{suffix}_{stamp}.txt'

    _write_csv(csv_path, results)
    _write_markdown(md_path, summary, results, args.live)
    _write_thesis_snippet(thesis_path, summary, args.live)
    json_path.write_text(
        json.dumps({'summary': summary, 'results': [r.__dict__ for r in results]}, indent=2),
        encoding='utf-8',
    )

    print(f"Evaluated: {summary['evaluated']}/{summary['total_cases']} (skipped {summary['skipped']})")
    print(f"Accuracy:  {summary['accuracy']:.1%}")
    print(f"FP: {summary['false_positive']}  FN: {summary['false_negative']}")
    print(f"CSV:  {csv_path}")
    print(f"MD:   {md_path}")
    print(f"JSON: {json_path}")
    print(f"Thesis: {thesis_path}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
