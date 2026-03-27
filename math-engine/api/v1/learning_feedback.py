import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from dmc_ai.chatbot import get_chatbot_service

router = APIRouter(prefix='/api/v1/learning', tags=['Learning'])


class FeedbackRequest(BaseModel):
    userId: int = Field(..., ge=1)
    windowDays: int = Field(30, ge=1, le=365)
    topNTopics: int = Field(3, ge=1, le=20)


def _topic_label(topic_slug: str) -> str:
    return (topic_slug or '').replace('.', ' ').replace('-', ' ').strip() or 'unknown topic'


def _rank_topics(skills: List[Dict[str, Any]], top_n: int) -> Dict[str, List[str]]:
    ordered = sorted(
        [s for s in skills if isinstance(s, dict) and s.get('topicSlug')],
        key=lambda s: float(s.get('pKnow') or 0.0),
        reverse=True,
    )
    strengths = [_topic_label(s['topicSlug']) for s in ordered[:top_n]]
    weaknesses = [_topic_label(s['topicSlug']) for s in list(reversed(ordered))[:top_n]]
    return {'strengths': strengths, 'weaknesses': weaknesses}


def _build_feedback_prompt(summary: Dict[str, Any], top_n: int) -> Dict[str, str]:
    skills = summary.get('skills') or []
    ranked = _rank_topics(skills, top_n)

    strengths = ranked['strengths']
    weaknesses = ranked['weaknesses']

    attempts = summary.get('attemptAggregates') or {}
    attempts_total = attempts.get('generatedAttemptsTotal')
    attempts_incorrect = attempts.get('generatedAttemptsIncorrect')
    avg_time = attempts.get('avgTimeSpentSeconds')

    system_prompt = (
        'You are an experienced mathematics teacher and an AI assistant in a learning platform. '
        'Write a short, motivating performance feedback message addressed to the student in second person ("You"). '
        'Praise strong areas, point out weak areas, and recommend what to focus on next. '
        'Do NOT mention Bayesian Knowledge Tracing, probabilities, or any raw numeric mastery values. '
        'Do NOT mention internal system names, endpoints, or database tables. '
        'Keep it concise (4-7 sentences), practical, and supportive.'
    )

    lines = [
        'Student performance summary (internal):',
        f'- Strong topics: {", ".join(strengths) if strengths else "N/A"}',
        f'- Weak topics: {", ".join(weaknesses) if weaknesses else "N/A"}',
    ]
    if attempts_total is not None and attempts_incorrect is not None:
        lines.append(f'- Recent practice attempts: {attempts_total} total, {attempts_incorrect} incorrect')
    if avg_time is not None:
        lines.append(f'- Average solve time: {int(float(avg_time))} seconds')
    topic_kpis = summary.get('topicKpis') or []
    if topic_kpis:
        best = max(topic_kpis, key=lambda t: float(t.get('successRate') or 0.0))
        worst = min(topic_kpis, key=lambda t: float(t.get('successRate') or 0.0))
        lines.append(
            f"- Best recent topic accuracy: {_topic_label(best.get('topicSlug', ''))} ({int((best.get('successRate') or 0.0) * 100)}%)"
        )
        lines.append(
            f"- Weak recent topic accuracy: {_topic_label(worst.get('topicSlug', ''))} ({int((worst.get('successRate') or 0.0) * 100)}%)"
        )
    error_breakdown = summary.get('errorTypeBreakdown') or {}
    if isinstance(error_breakdown, dict) and error_breakdown:
        top_error = max(error_breakdown.items(), key=lambda kv: int(kv[1]))[0]
        if top_error != 'NONE':
            lines.append(f'- Most frequent error category: {top_error}')

    user_prompt = '\n'.join(lines)
    return {'system': system_prompt, 'user': user_prompt}


def _build_structured_recommendations(summary: Dict[str, Any], raw_attempts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    recs: List[Dict[str, Any]] = []
    topic_kpis = summary.get('topicKpis') or []
    if topic_kpis:
        worst = min(topic_kpis, key=lambda t: float(t.get('successRate') or 0.0))
        recs.append({
            'type': 'weak_topic',
            'topic': worst.get('topicSlug'),
            'message': f"Focus next on {_topic_label(worst.get('topicSlug', ''))}.",
        })
    hint_attempts = [a for a in raw_attempts if bool(a.get('hintUsed'))]
    if raw_attempts:
        hint_ratio = len(hint_attempts) / max(1, len(raw_attempts))
        if hint_ratio > 0.35:
            recs.append({
                'type': 'hint_dependency',
                'message': 'Try solving 2-3 tasks without hints before checking help.',
            })
    late_night = [a for a in raw_attempts if bool(a.get('lateNight'))]
    if raw_attempts and len(late_night) / max(1, len(raw_attempts)) > 0.4:
        recs.append({
            'type': 'schedule',
            'message': 'A large share of practice is late-night; try one daytime session for better accuracy.',
        })
    return recs


def _fallback_feedback(strengths: List[str], weaknesses: List[str]) -> str:
    s_part = f'You are doing well in: {", ".join(strengths)}.' if strengths else 'You are making progress—keep going.'
    w_part = f'Next, focus on: {", ".join(weaknesses)}.' if weaknesses else 'Pick one topic and practice it consistently.'
    return (
        f'{s_part} '
        f'{w_part} '
        'Try solving a few medium-difficulty problems slowly and carefully, then increase difficulty once you feel confident.'
    )


@router.post('/feedback')
def learning_feedback(req: FeedbackRequest):
    backend_base_url = os.environ.get('DMC_BACKEND_URL', 'http://localhost:8080').rstrip('/')
    internal_key = os.environ.get('DMC_MATH_ENGINE_API_KEY', '')

    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(
                f'{backend_base_url}/api/analytics/bkt/summary',
                params={'userId': req.userId, 'windowDays': req.windowDays},
                headers={'X-Internal-Api-Key': internal_key} if internal_key else {},
            )
            if r.status_code >= 400:
                raise HTTPException(status_code=502, detail={'backendStatus': r.status_code, 'body': r.text[:500]})
            summary = r.json()
            raw_r = client.get(
                f'{backend_base_url}/api/analytics/bkt/raw-dataset',
                params={'userId': req.userId, 'windowDays': req.windowDays},
                headers={'X-Internal-Api-Key': internal_key} if internal_key else {},
            )
            raw_dataset = raw_r.json() if raw_r.status_code < 400 else {'attempts': []}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    skills = summary.get('skills') or []
    ranked = _rank_topics(skills, req.topNTopics)
    strengths = ranked['strengths']
    weaknesses = ranked['weaknesses']

    attempts = summary.get('attemptAggregates') or {}
    attempts_total = attempts.get('generatedAttemptsTotal')
    min_required = int(os.environ.get('DMC_MIN_ATTEMPTS_FOR_FEEDBACK', '10') or '10')
    if isinstance(attempts_total, int) and attempts_total < min_required:
        remaining = max(0, min_required - attempts_total)
        return {
            'feedbackText': (
                f'You have a good start, but I need a bit more data to give a reliable personalized analysis. '
                f'Try solving at least {remaining} more practice problem(s), then run the analysis again. '
                f'For now, keep practicing consistently and review mistakes carefully.'
            ),
            'focusTopics': weaknesses,
            'strengths': strengths,
            'generatedAt': datetime.now(timezone.utc).isoformat(),
        }

    prompts = _build_feedback_prompt(summary, req.topNTopics)
    raw_attempts = raw_dataset.get('attempts') or []
    if raw_attempts:
        prompts['user'] += (
            '\n'
            f"- Dataset rows available for deeper analysis: {len(raw_attempts)}"
        )
    service = get_chatbot_service()
    result = service.chat(
        [
            {'role': 'system', 'content': prompts['system']},
            {'role': 'user', 'content': prompts['user']},
        ],
        subject='learning',
        module='feedback',
    )

    if 'error' in result:
        text = _fallback_feedback(strengths, weaknesses)
    else:
        text = str(result.get('reply', '')).strip()
        if not text:
            text = _fallback_feedback(strengths, weaknesses)

    return {
        'feedbackText': text,
        'focusTopics': weaknesses,
        'strengths': strengths,
        'recommendations': _build_structured_recommendations(summary, raw_attempts),
        'generatedAt': datetime.now(timezone.utc).isoformat(),
    }

