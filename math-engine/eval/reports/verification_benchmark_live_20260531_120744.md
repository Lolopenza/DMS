# Hybrid Verification Benchmark Report

- Generated: 2026-05-31 12:07 UTC
- Mode: live LLM included
- Benchmark: `eval/verification_benchmark.json`

## Summary

| Metric | Value |
|--------|-------|
| Total cases | 50 |
| Evaluated | 50 |
| Skipped | 0 |
| Accuracy (match with ground truth) | **86.0%** |
| True positive | 22 |
| True negative | 21 |
| False positive (accepted wrong) | 3 |
| False negative (rejected correct) | 4 |
| Precision | 88.0% |
| Recall | 84.6% |
| Mean confidence (evaluated) | 0.6704 |

## By verification_method

| Method | N | Accuracy | FP | FN |
| code-judge | 6 | 66.7% | 2 | 0 |
| code-judge-unavailable | 1 | 100.0% | 0 | 0 |
| math-judge | 2 | 100.0% | 0 | 0 |
| semantic | 11 | 81.8% | 1 | 1 |
| semantic-fallback | 15 | 80.0% | 0 | 3 |
| symbolic | 15 | 100.0% | 0 | 0 |

## By category

| Category | N | Accuracy |
| code-judge | 7 | 71.4% |
| edge | 4 | 100.0% |
| math-judge | 2 | 100.0% |
| semantic | 14 | 64.3% |
| semantic-fallback | 8 | 100.0% |
| symbolic | 15 | 100.0% |

## Mismatches (system vs ground truth)

- **sem-001** (false_negative, `semantic-fallback`): ground=True, system=False — Free-form correct explanation (needs LLM)
  - Feedback: Automatic comparison used — could not parse AI verification.
- **sem-003** (false_negative, `semantic-fallback`): ground=True, system=False — Equivalent wording correct (needs LLM)
  - Feedback: Automatic comparison used — could not parse AI verification.
- **sem-006** (false_negative, `semantic-fallback`): ground=True, system=False — Formula in words n*(n-1)/2 (needs LLM)
  - Feedback: Automatic comparison used — could not parse AI verification.
- **sem-mock-004** (false_positive, `semantic`): ground=False, system=True — Mock LLM false positive (thesis error example)
  - Note: Simulates LLM wrongly accepting an incorrect answer — use in thesis as failure mode
  - Feedback: Looks fine.
- **sem-mock-006** (false_negative, `semantic`): ground=True, system=False — Mock false negative (thesis error example)
  - Note: Simulates LLM wrongly rejecting a correct free-form answer
  - Feedback: Answer format unclear.
- **code-003** (false_positive, `code-judge`): ground=False, system=True — Logic bug passes syntax (mock false positive)
  - Note: Code looks valid but wrong algorithm — illustrates no sandbox execution
  - Feedback: Acceptable.
- **code-006** (false_positive, `code-judge`): ground=False, system=True — Off-by-one loop bug (mock false positive)
  - Note: Classic fencepost error — LLM may still accept
  - Feedback: Looks like a sum loop.

## Manual teacher review candidates (confidence < 0.55)

- fallback-003: String false boolean from LLM (parse guard) — method=semantic-fallback, confidence=0.28
- fallback-004: LLM down, wrong answer vs expected — method=semantic-fallback, confidence=0.3
- fallback-006: Non-equivalent decimals (LLM down) — method=semantic-fallback, confidence=0.3
- sem-001: Free-form correct explanation (needs LLM) — method=semantic-fallback, confidence=0.28
- sem-003: Equivalent wording correct (needs LLM) — method=semantic-fallback, confidence=0.28
- sem-006: Formula in words n*(n-1)/2 (needs LLM) — method=semantic-fallback, confidence=0.28
- sem-mock-003: Mock LLM low confidence reject — method=semantic, confidence=0.4
- code-004: LLM unavailable for code — method=code-judge-unavailable, confidence=0.28
- edge-001: Unparseable candidate with expression present — method=semantic-fallback, confidence=0.3
- edge-002: Empty candidate — method=semantic-fallback, confidence=0.3
- edge-003: Null-like string candidate — method=semantic-fallback, confidence=0.3
- edge-004: LaTeX-like answer falls to fallback — method=semantic-fallback, confidence=0.3

## Interpretation notes for thesis

- **Symbolic** cases validate SymPy path (deterministic, high expected accuracy).
- **semantic-fallback** cases validate behaviour when LLM is unavailable.
- **semantic** with `--live` measures real Gemini/Groq judge quality (non-deterministic).
- **code-judge** illustrates limits: no code execution; false positives possible.
- Cases with `llmMock` false-positive simulate documented LLM failure modes for discussion.
