import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  generateInteractiveProblem,
  listMyGeneratedProblems,
  submitGeneratedProblemAttempt,
} from '../../api.js';
import { TRACKS_PATH, USER_DASHBOARD_PATH } from '../../routes.js';

const TOPIC_OPTIONS = [
  { value: 'combinatorics', label: 'Combinatorics' },
  { value: 'graph_theory', label: 'Graph Theory' },
  { value: 'logic', label: 'Logic' },
  { value: 'set_theory', label: 'Set Theory' },
  { value: 'number_theory', label: 'Number Theory' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const MODE_OPTIONS = [
  { value: 'AI', label: 'AI', hint: 'Adaptive task generated from model output' },
  { value: 'TEMPLATE', label: 'Template', hint: 'Stable task based on curated templates' },
];

export default function InteractivePractice() {
  const [topicSlug, setTopicSlug] = useState('combinatorics');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [mode, setMode] = useState('AI');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  async function loadHistory() {
    try {
      const items = await listMyGeneratedProblems();
      setHistory(Array.isArray(items) ? items : []);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function onGenerate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const generated = await generateInteractiveProblem({
        topicSlug,
        difficulty,
        skillLevel,
        mode,
      });
      setCurrent(generated);
      setAnswer('');
      await loadHistory();
    } catch (e) {
      setError(e.message || 'Failed to generate problem');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAnswer(e) {
    e.preventDefault();
    if (!current || !String(answer).trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await submitGeneratedProblemAttempt(current.id, {
        answer: String(answer).trim(),
      });
      setResult(response);
      await loadHistory();
    } catch (e2) {
      setError(e2.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  function useHistoryItem(item) {
    setCurrent(item);
    setResult(null);
    setError('');
    setAnswer('');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  const selectedMode = MODE_OPTIONS.find((item) => item.value === mode);

  return (
    <div className="container practice-page">
      <div className="page-title">
        <h2>Personal Practice Lab</h2>
        <p className="subtitle">Generate focused tasks by topic and difficulty, submit an answer, and get immediate feedback.</p>
      </div>

      <div className="practice-hero-actions">
        <Link to={USER_DASHBOARD_PATH} className="btn btn-outline">
          <i className="fas fa-arrow-left"></i> Back to dashboard
        </Link>
        <Link to={TRACKS_PATH} className="btn btn-outline">
          <i className="fas fa-layer-group"></i> Explore tracks
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
          <div className="practice-toolbar">
            <span className="practice-chip"><i className="fas fa-bolt"></i> Fast practice cycle</span>
            <span className="practice-chip"><i className="fas fa-brain"></i> Smart verification</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label>
              Topic
              <select value={topicSlug} onChange={(e) => setTopicSlug(e.target.value)}>
                {TOPIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              Practice mode
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              Skill level
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>

          <p className="practice-mode-hint">
            <i className="fas fa-circle-info"></i>
            <span>{selectedMode?.hint || 'Choose a mode to continue.'}</span>
          </p>

          <button type="button" className="btn btn-primary" onClick={onGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Problem'}
          </button>

          {error && <div className="ui-state ui-state-error">{error}</div>}
        </div>
      </div>

      {current && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body">
            <h3>Current problem</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{current.questionText}</p>
            <p><strong>Mode:</strong> {current.generationMode} | <strong>Difficulty:</strong> {current.difficulty}</p>
            <p><strong>Topic:</strong> {current.topicSlug || 'n/a'} | <strong>Score:</strong> {current.difficultyScore}</p>

            <form onSubmit={onSubmitAnswer} style={{ display: 'grid', gap: '0.75rem' }}>
              <label>
                Your answer
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                />
              </label>
              <p className="practice-answer-tip">
                <i className="fas fa-lightbulb"></i>
                <span>Tip: submit a clean numeric or symbolic answer (examples: 28, n*(n-1)/2).</span>
              </p>
              <button type="submit" className="btn btn-secondary" disabled={submitting}>
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>
            </form>

            {result && (
              <div className={`ui-state ${result.correct ? 'ui-state-success' : 'ui-state-warning'}`} style={{ marginTop: '0.75rem' }}>
                <p><strong>Correct:</strong> {String(result.correct)}</p>
                <p><strong>Method:</strong> {result.verificationMethod}</p>
                <p><strong>Confidence:</strong> {result.confidence}</p>
                <p><strong>XP:</strong> {result.xpEarned}</p>
                <p><strong>Feedback:</strong> {result.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h3>Recent generated problems</h3>
          {!history.length && <p>No generated problems yet.</p>}
          {history.length > 0 && (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {history.slice(0, 10).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="practice-history-item"
                  onClick={() => useHistoryItem(item)}
                >
                  <p style={{ margin: 0 }}><strong>#{item.id}</strong> {item.questionText}</p>
                  <small>
                    {item.generationMode} | {item.difficulty} | attempts: {item.attemptCount} | correct: {item.correctCount}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
