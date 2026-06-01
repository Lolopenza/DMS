# Hybrid verification benchmark (thesis)

Evaluates SymPy + LLM hybrid grading against ground-truth labels.

## Quick start

From `math-engine/`:

```powershell
.venv\Scripts\python.exe eval/run_verification_benchmark.py --live
```

Use `--live` for the thesis benchmark (N=50, includes real Gemini on 7 semantic cases).

Mock-only run (skips `requiresLiveLlm` cases) is optional for reproducible CI-style checks:

```powershell
.venv\Scripts\python.exe eval/run_verification_benchmark.py
```

## Thesis reports (`eval/reports/`)

Canonical live run (Section B):

| File | Purpose |
|------|---------|
| `THESIS_SECTION_B_DATA_EN.txt` | All numbers + error narratives for LaTeX AI |
| `thesis_tables_live_20260531_120744.txt` | Tables B.1–B.5 (tab-separated) |
| `verification_benchmark_live_20260531_120744.md` | Full report with mismatch notes |
| `verification_benchmark_live_20260531_120744.csv` | 50 cases — appendix / Excel |

Re-run `--live` to regenerate with a new timestamp; update thesis citations accordingly.

## Benchmark cases

**50 cases** in `eval/verification_benchmark.json`:

| Field | Meaning |
|-------|---------|
| `groundTruthCorrect` | Human / teacher label |
| `request` | Body for `/verify` (VerifyRequest) |
| `llmMock` | Fixed LLM JSON reply (reproducible semantic/code tests) |
| `forceLlmError` | Force fallback path (LLM unavailable) |
| `requiresLiveLlm` | Only run with `--live` |
| `notes` | Thesis commentary (e.g. simulated false positive) |

## Metrics

- **Accuracy** = system verdict matches ground truth
- **False positive** = accepted wrong answer
- **False negative** = rejected correct answer
- Breakdown by `verification_method` and category
- **Manual review candidates**: confidence < 0.55
