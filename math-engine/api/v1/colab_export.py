from datetime import datetime, timezone

import nbformat
import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field
from dmc_ai.chatbot import get_chatbot_service

router = APIRouter(prefix='/api/v1/colab', tags=['Colab Export'])


class ColabStarterRequest(BaseModel):
    userId: int = Field(..., ge=1)
    windowDays: int = Field(30, ge=1, le=365)
    lessonMode: bool = Field(True)


def _load_student_summary(user_id: int, window_days: int):
    backend_base_url = __import__('os').environ.get('DMC_BACKEND_URL', 'http://localhost:8080').rstrip('/')
    internal_key = __import__('os').environ.get('DMC_MATH_ENGINE_API_KEY', '')
    try:
        with httpx.Client(timeout=10.0) as client:
            summary_resp = client.get(
                f'{backend_base_url}/api/analytics/bkt/summary',
                params={'userId': user_id, 'windowDays': window_days},
                headers={'X-Internal-Api-Key': internal_key} if internal_key else {},
            )
            raw_resp = client.get(
                f'{backend_base_url}/api/analytics/bkt/raw-dataset',
                params={'userId': user_id, 'windowDays': window_days},
                headers={'X-Internal-Api-Key': internal_key} if internal_key else {},
            )
            summary = summary_resp.json() if summary_resp.status_code < 400 else {}
            raw = raw_resp.json() if raw_resp.status_code < 400 else {}
            return summary, raw
    except Exception:
        return {}, {}


def _build_lesson_markdown(user_id: int, window_days: int) -> str:
    summary, raw = _load_student_summary(user_id, window_days)
    attempts = raw.get('attempts') or []
    error_breakdown = summary.get('errorTypeBreakdown') or {}
    top_errors = sorted(error_breakdown.items(), key=lambda x: int(x[1]), reverse=True)[:3] if isinstance(error_breakdown, dict) else []
    top_errors_text = ', '.join([f'{k}:{v}' for k, v in top_errors]) or 'n/a'
    topic_kpis = summary.get('topicKpis') or []
    weakest = min(topic_kpis, key=lambda t: float(t.get('successRate') or 0.0)).get('topicSlug') if topic_kpis else 'n/a'

    system_prompt = (
        "You are an AI tutor writing concise notebook lesson text for IT students (CS / "
        "software engineering) learning discrete math and ML for interviews and systems "
        "thinking. Return markdown with exactly 3 sections: "
        "1) Interpret metrics, 2) Data pitfalls, 3) Discrete-math to ML bridge. "
        "Tie advice to realistic CS contexts (debugging, complexity, data pipelines) where "
        "natural. Keep it under 220 words."
    )
    user_prompt = (
        f"Student id: {user_id}\n"
        f"Window days: {window_days}\n"
        f"Attempts rows: {len(attempts)}\n"
        f"Weakest topic: {weakest}\n"
        f"Top error types: {top_errors_text}\n"
        "Include one fill-in-the-blank interpretation sentence."
    )
    try:
        service = get_chatbot_service()
        res = service.chat(
            [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            subject='learning',
            module='colab-lesson-mode',
        )
        if 'reply' in res and str(res['reply']).strip():
            return str(res['reply']).strip()
    except Exception:
        pass

    return (
        "## Interpret metrics\n"
        "- Accuracy = share of correct answers on your test split.\n"
        "- Balanced accuracy is safer when classes are imbalanced.\n"
        "- Confusion matrix shows where model predicts wrong vs correct.\n\n"
        "## Data pitfalls\n"
        "- Small sample size can make metrics unstable.\n"
        "- Class imbalance can inflate plain accuracy.\n"
        "- Leakage risk: using future-related signals accidentally.\n"
        "- Fill the blank: `The model likely suffers from [________] because [________].`\n\n"
        "## Discrete-math to ML bridge\n"
        "- Logic topics map to binary classification thinking.\n"
        "- Graph-theory trend checks improve reasoning about structure.\n"
        "- Combinatorics helps reason about feature combinations and model space."
    )


@router.post('/starter')
def build_colab_starter(req: ColabStarterRequest):
    nb = nbformat.v4.new_notebook()
    lesson_markdown = _build_lesson_markdown(req.userId, req.windowDays) if req.lessonMode else ""
    nb.cells = [
        nbformat.v4.new_markdown_cell(
            "# DMC Learning Analytics Starter\n\n"
            f"User ID: **{req.userId}**  \n"
            f"Window: **{req.windowDays} days**\n\n"
            "Upload CSV exported from DMC (`my-learning-analytics-<id>.csv`) and run all cells.\n\n"
            "Security note: this starter is intentionally CSV-first. It does not embed access tokens or internal API keys."
        ),
        nbformat.v4.new_markdown_cell(
            "## How to use this notebook\n"
            "1. Upload your CSV from the platform.\n"
            "2. Run cells top-to-bottom.\n"
            "3. Read generated insights in plain language.\n"
            "4. Try challenge tasks at the end (logic/graph/combinatorics).\n\n"
            "If your dataset is small, model metrics can be unstable. This is expected and shown explicitly."
        ),
        nbformat.v4.new_markdown_cell(
            "## Lesson mode (AI Tutor)\n"
            + (lesson_markdown if lesson_markdown else "Lesson mode disabled for this notebook.")
        ),
        nbformat.v4.new_code_cell(
            "import pandas as pd\n"
            "import numpy as np\n"
            "import matplotlib.pyplot as plt\n"
            "import warnings\n"
            "from sklearn.model_selection import train_test_split\n"
            "from sklearn.preprocessing import OneHotEncoder, StandardScaler\n"
            "from sklearn.compose import ColumnTransformer\n"
            "from sklearn.pipeline import Pipeline\n"
            "from sklearn.linear_model import LogisticRegression\n"
            "from sklearn.tree import DecisionTreeClassifier\n"
            "from sklearn.cluster import KMeans\n"
            "from sklearn.metrics import accuracy_score, balanced_accuracy_score, confusion_matrix\n"
            "\n"
            "CSV_PATH = 'my_learning_analytics.csv'  # rename uploaded file if needed\n"
            "df = pd.read_csv(CSV_PATH)\n"
            "df.head()"
        ),
        nbformat.v4.new_code_cell(
            "# Basic EDA\n"
            "print('Rows:', len(df))\n"
            "print('Columns:', list(df.columns))\n"
            "print('Correct rate:', round(df['correct'].astype(int).mean(), 3) if 'correct' in df.columns else 'n/a')\n"
            "display(df.describe(include='all').T)\n"
            "display(df.isna().sum().to_frame('missing'))"
        ),
        nbformat.v4.new_code_cell(
            "# Topic-level performance\n"
            "topic = df.groupby('topicSlug').agg(\n"
            "    attempts=('correct','count'),\n"
            "    accuracy=('correct','mean'),\n"
            "    avg_time=('timeSpentSeconds','mean')\n"
            ").reset_index().sort_values('attempts', ascending=False)\n"
            "display(topic)\n"
            "topic.plot(x='topicSlug', y='accuracy', kind='bar', figsize=(10,4), title='Accuracy by topic')\n"
            "plt.ylim(0,1)\n"
            "plt.show()"
        ),
        nbformat.v4.new_markdown_cell(
            "## ML Scenario 1: Will next attempt be correct?\n"
            "Logistic regression on **your own** attempt history (topic, difficulty, timing, "
            "hints, hour of day). Same spirit as: “with what probability will I get the next "
            "graph-theory item right if I practice at 2am?” — see Scenario 1b for a tree-based "
            "counterfactual on time-of-day."
        ),
        nbformat.v4.new_code_cell(
            "model_df = df.copy()\n"
            "model_df['correct'] = model_df['correct'].astype(int)\n"
            "features = ['topicSlug','difficultyAtAttempt','timeSpentSeconds','timeToFirstActionSeconds','hintUsed','hourOfDay','dayOfWeek']\n"
            "for c in ['timeSpentSeconds','timeToFirstActionSeconds','hourOfDay','dayOfWeek']:\n"
            "    model_df[c] = model_df[c].fillna(model_df[c].median())\n"
            "model_df['hintUsed'] = model_df['hintUsed'].fillna(False).astype(int)\n"
            "X = model_df[features]\n"
            "y = model_df['correct']\n"
            "class_counts = y.value_counts().to_dict()\n"
            "print('Class distribution (0=wrong,1=correct):', class_counts)\n"
            "if len(model_df) < 20 or y.nunique() < 2:\n"
            "    print('Not enough data for stable logistic regression. Collect more attempts (recommended: 20+ with both classes).')\n"
            "else:\n"
            "    cat_cols = ['topicSlug', 'difficultyAtAttempt']\n"
            "    num_cols = [c for c in features if c not in cat_cols]\n"
            "    pre = ColumnTransformer([\n"
            "        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),\n"
            "        ('num', StandardScaler(), num_cols),\n"
            "    ])\n"
            "    clf = Pipeline([('pre', pre), ('model', LogisticRegression(max_iter=200))])\n"
            "    strat = y if y.value_counts().min() > 1 else None\n"
            "    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=strat)\n"
            "    clf.fit(X_train, y_train)\n"
            "    pred = clf.predict(X_test)\n"
            "    acc = accuracy_score(y_test, pred)\n"
            "    bacc = balanced_accuracy_score(y_test, pred)\n"
            "    naive = max(y_test.mean(), 1 - y_test.mean())\n"
            "    print('Test accuracy:', round(acc, 4))\n"
            "    print('Balanced accuracy:', round(bacc, 4))\n"
            "    print('Naive baseline (majority class):', round(float(naive), 4))\n"
            "    print('Confusion matrix:\\n', confusion_matrix(y_test, pred))"
        ),
        nbformat.v4.new_markdown_cell(
            "## ML Scenario 1b: Decision tree + “night coding” counterfactual\n"
            "Train a shallow tree on the same features, then compare **predicted P(correct)** "
            "for the same template session at **2:00** vs **14:00** (hour of day only). "
            "Interpret loosely (small N → noisy); still useful for a thesis demo."
        ),
        nbformat.v4.new_code_cell(
            "model_df = df.copy()\n"
            "model_df['correct'] = model_df['correct'].astype(int)\n"
            "features = ['topicSlug','difficultyAtAttempt','timeSpentSeconds','timeToFirstActionSeconds','hintUsed','hourOfDay','dayOfWeek']\n"
            "for c in ['timeSpentSeconds','timeToFirstActionSeconds','hourOfDay','dayOfWeek']:\n"
            "    model_df[c] = model_df[c].fillna(model_df[c].median())\n"
            "model_df['hintUsed'] = model_df['hintUsed'].fillna(False).astype(int)\n"
            "X = model_df[features]\n"
            "y = model_df['correct']\n"
            "if len(model_df) < 20 or y.nunique() < 2:\n"
            "    print('Need more data for tree counterfactual (20+ rows, both outcomes).')\n"
            "else:\n"
            "    cat_cols = ['topicSlug', 'difficultyAtAttempt']\n"
            "    num_cols = [c for c in features if c not in cat_cols]\n"
            "    pre = ColumnTransformer([\n"
            "        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols),\n"
            "        ('num', StandardScaler(), num_cols),\n"
            "    ])\n"
            "    tree_clf = Pipeline([\n"
            "        ('pre', pre),\n"
            "        ('model', DecisionTreeClassifier(max_depth=5, min_samples_leaf=3, random_state=42)),\n"
            "    ])\n"
            "    strat = y if y.value_counts().min() > 1 else None\n"
            "    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=strat)\n"
            "    tree_clf.fit(X_train, y_train)\n"
            "    print('Tree holdout accuracy:', round(accuracy_score(y_test, tree_clf.predict(X_test)), 4))\n"
            "    graph_mask = model_df['topicSlug'].astype(str).str.contains('graph', case=False, na=False)\n"
            "    template = model_df.loc[graph_mask].iloc[[0]] if graph_mask.any() else model_df.iloc[[0]]\n"
            "    night = template.copy()\n"
            "    day = template.copy()\n"
            "    night['hourOfDay'] = 2\n"
            "    day['hourOfDay'] = 14\n"
            "    p_night = tree_clf.predict_proba(night[features])[0, 1]\n"
            "    p_day = tree_clf.predict_proba(day[features])[0, 1]\n"
            "    print('Template topic:', template['topicSlug'].iloc[0])\n"
            "    print('P(correct) at 02:00 local hour:', round(float(p_night), 4))\n"
            "    print('P(correct) at 14:00 local hour:', round(float(p_day), 4))"
        ),
        nbformat.v4.new_markdown_cell(
            "## Optional baseline: Linear trend of performance\n"
            "Simple linear regression over attempt index to estimate trend direction."
        ),
        nbformat.v4.new_code_cell(
            "from sklearn.linear_model import LinearRegression\n"
            "trend_df = df.reset_index(drop=True).copy()\n"
            "trend_df['attempt_idx'] = trend_df.index + 1\n"
            "X = trend_df[['attempt_idx']]\n"
            "y = trend_df['correct'].astype(int)\n"
            "lin = LinearRegression().fit(X, y)\n"
            "print('Slope (positive means improving):', round(float(lin.coef_[0]), 4))"
        ),
        nbformat.v4.new_markdown_cell(
            "## ML Scenario 2: Error pattern clustering\n"
            "K-Means over behavioral features."
        ),
        nbformat.v4.new_code_cell(
            "cluster_df = df.copy()\n"
            "for c in ['timeSpentSeconds','timeToFirstActionSeconds','hourOfDay','dayOfWeek']:\n"
            "    cluster_df[c] = cluster_df[c].fillna(cluster_df[c].median())\n"
            "cluster_X = cluster_df[['timeSpentSeconds','timeToFirstActionSeconds','hourOfDay','dayOfWeek']]\n"
            "warnings.filterwarnings('ignore', category=RuntimeWarning)\n"
            "n_clusters = 3 if len(cluster_X) >= 9 else max(2, min(3, len(cluster_X)))\n"
            "kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)\n"
            "cluster_df['cluster'] = kmeans.fit_predict(cluster_X)\n"
            "display(cluster_df.groupby('cluster')[['correct','timeSpentSeconds','hourOfDay']].mean())"
        ),
        nbformat.v4.new_markdown_cell(
            "## ML Scenario 3: Mini-BKT style progression\n"
            "Simple learning curve by attempt index inside topic."
        ),
        nbformat.v4.new_code_cell(
            "curve = df.groupby('attemptIndexWithinTopic')['correct'].mean().reset_index()\n"
            "curve.plot(x='attemptIndexWithinTopic', y='correct', marker='o', figsize=(8,4), title='Mini-BKT learning curve')\n"
            "plt.ylim(0,1)\n"
            "plt.show()"
        ),
        nbformat.v4.new_markdown_cell(
            "## Human explanation (auto)\n"
            "This cell writes a short interpretation of your data in plain language."
        ),
        nbformat.v4.new_code_cell(
            "overall_acc = float(df['correct'].astype(int).mean()) if len(df) else 0.0\n"
            "avg_time = float(df['timeSpentSeconds'].dropna().mean()) if 'timeSpentSeconds' in df and df['timeSpentSeconds'].notna().any() else None\n"
            "worst_topic = None\n"
            "if 'topicSlug' in df.columns and len(df):\n"
            "    topic_acc = df.groupby('topicSlug')['correct'].mean().sort_values()\n"
            "    if len(topic_acc):\n"
            "        worst_topic = topic_acc.index[0]\n"
            "lines = []\n"
            "lines.append(f'- Overall accuracy: {overall_acc:.1%}')\n"
            "if avg_time is not None:\n"
            "    lines.append(f'- Average solve time: {avg_time:.1f} sec')\n"
            "if worst_topic:\n"
            "    lines.append(f'- Focus next on topic: {worst_topic}')\n"
            "print('\\n'.join(lines))"
        ),
        nbformat.v4.new_markdown_cell(
            "## Challenge cells (for discrete math context)\n"
            "Try these mini-research tasks on your own data."
        ),
        nbformat.v4.new_code_cell(
            "# Challenge 1 (logic): compare your accuracy in logic vs non-logic topics\n"
            "logic_mask = df['topicSlug'].astype(str).str.contains('logic', case=False, na=False)\n"
            "print('Logic accuracy:', df.loc[logic_mask, 'correct'].astype(int).mean() if logic_mask.any() else 'n/a')\n"
            "print('Other topics accuracy:', df.loc[~logic_mask, 'correct'].astype(int).mean() if (~logic_mask).any() else 'n/a')"
        ),
        nbformat.v4.new_code_cell(
            "# Challenge 2 (graph theory): does solve time decrease over attempts?\n"
            "g = df[df['topicSlug'].astype(str).str.contains('graph', case=False, na=False)].copy()\n"
            "if len(g) >= 2:\n"
            "    g = g.sort_values('createdAt').reset_index(drop=True)\n"
            "    g['idx'] = g.index + 1\n"
            "    g[['idx','timeSpentSeconds']].plot(x='idx', y='timeSpentSeconds', marker='o', figsize=(8,4), title='Graph-theory time trend')\n"
            "    plt.show()\n"
            "else:\n"
            "    print('Not enough graph-theory rows yet')"
        ),
        nbformat.v4.new_code_cell(
            "# Challenge 3 (combinatorics): speed-vs-accuracy tradeoff\n"
            "c = df[df['topicSlug'].astype(str).str.contains('combinatorics', case=False, na=False)].copy()\n"
            "if len(c) >= 3:\n"
            "    c['correct'] = c['correct'].astype(int)\n"
            "    c.plot.scatter(x='timeSpentSeconds', y='correct', figsize=(7,4), title='Combinatorics: time vs correctness')\n"
            "    plt.show()\n"
            "else:\n"
            "    print('Not enough combinatorics rows yet')"
        ),
        nbformat.v4.new_markdown_cell(
            "## Reflection task\n"
            "Write 3 short conclusions in your own words:\n"
            "1. Which metric is most trustworthy for your dataset and why?\n"
            "2. Which data pitfall is most likely in your run and how to reduce it?\n"
            "3. Which discrete-math topic should you practice next based on evidence?"
        ),
    ]
    filename = f'dmc-colab-starter-user-{req.userId}-{req.windowDays}d.ipynb'
    return {
        'filename': filename,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'notebook': nbformat.writes(nb),
    }
