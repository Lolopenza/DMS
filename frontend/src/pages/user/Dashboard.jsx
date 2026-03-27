import React from 'react';
import { Link } from 'react-router-dom';
import {
  CALCULATOR_PATH,
  MATH_ROADMAP_PATH,
  TRACKS_PATH,
  USER_PRACTICE_PATH,
  USER_PROFILE_PATH,
  USER_SETTINGS_PATH,
} from '../../routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import SkillMasteryDashboard from '../../components/SkillMasteryDashboard.jsx';
import FeedbackModal from '../../components/FeedbackModal.jsx';
import ColabExportCard from '../../components/ColabExportCard.jsx';
import StudentMiniLab from '../../components/StudentMiniLab.jsx';
import JupyterLiteSandboxCard from '../../components/JupyterLiteSandboxCard.jsx';
import {
  getLearningFeedback,
  getMyAnalyticsCsvUrl,
  getMyColabStarter,
  getStudentFeedbackStatus,
  submitStudentFeedback,
} from '../../api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.username || 'Student';
  const [feedback, setFeedback] = React.useState(null);
  const [loadingFeedback, setLoadingFeedback] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = React.useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = React.useState(false);
  const [feedbackSent, setFeedbackSent] = React.useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = React.useState(false);
  const [exportWindowDays, setExportWindowDays] = React.useState(30);
  const [colabAiLessonMode, setColabAiLessonMode] = React.useState(true);
  const [exportingNotebook, setExportingNotebook] = React.useState(false);
  const [exportError, setExportError] = React.useState('');
  const [exportDone, setExportDone] = React.useState(false);

  async function onAnalyze() {
    setLoadingFeedback(true);
    setFeedbackError('');
    try {
      const res = await getLearningFeedback({ windowDays: 30, topNTopics: 3 });
      setFeedback(res);
    } catch (e) {
      setFeedbackError(e.message || 'Failed to generate feedback');
      setFeedback(null);
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function onSubmitFeedback(payload) {
    setFeedbackSubmitError('');
    setFeedbackSubmitting(true);
    try {
      await submitStudentFeedback({
        rating: payload.rating,
        comment: payload.comment || '',
        source: 'user-dashboard',
      });
      setFeedbackSent(true);
      setHasSubmittedFeedback(true);
      setFeedbackModalOpen(false);
    } catch (e) {
      setFeedbackSubmitError(e.message || 'Failed to send feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  React.useEffect(() => {
    let timerId = null;
    let mounted = true;
    const fallbackDelayMs = 10000;

    async function bootstrapFeedbackPrompt() {
      try {
        const status = await getStudentFeedbackStatus();
        if (!mounted) return;

        const alreadySubmitted = Boolean(status?.hasSubmitted);
        setHasSubmittedFeedback(alreadySubmitted);
        if (alreadySubmitted || !status?.shouldPrompt) {
          return;
        }

        const delayMs = Math.max(0, Number(status?.promptDelaySeconds || 300) * 1000);
        timerId = setTimeout(() => {
          setFeedbackModalOpen(true);
        }, delayMs);
      } catch {
        // Fallback: auto-prompt once after a short delay if status endpoint is unavailable.
        if (!mounted) return;
        timerId = setTimeout(() => {
          setFeedbackModalOpen(true);
        }, fallbackDelayMs);
      }
    }

    bootstrapFeedbackPrompt();
    return () => {
      mounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  function onDownloadCsv() {
    window.open(getMyAnalyticsCsvUrl(exportWindowDays), '_blank', 'noopener,noreferrer');
  }

  async function onDownloadNotebook() {
    setExportError('');
    setExportDone(false);
    setExportingNotebook(true);
    try {
      const res = await getMyColabStarter(exportWindowDays, colabAiLessonMode);
      const notebookContent = String(res?.notebook || '');
      if (!notebookContent) {
        throw new Error('Notebook payload is empty');
      }
      const filename = String(res?.filename || `dmc-colab-starter-${exportWindowDays}d.ipynb`);
      const blob = new Blob([notebookContent], { type: 'application/x-ipynb+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } catch (e) {
      setExportError(e.message || 'Failed to prepare notebook');
    } finally {
      setExportingNotebook(false);
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1><i className="fas fa-chart-line"></i> Welcome back, {displayName}!</h1>
        <p className="subtitle">Pick up where you left off or explore something new today.</p>
      </div>

      <SkillMasteryDashboard />
      <StudentMiniLab />

      <ColabExportCard
        windowDays={exportWindowDays}
        setWindowDays={setExportWindowDays}
        aiLessonMode={colabAiLessonMode}
        setAiLessonMode={setColabAiLessonMode}
        onDownloadCsv={onDownloadCsv}
        onDownloadNotebook={onDownloadNotebook}
        exporting={exportingNotebook}
        exportError={exportError}
        exportDone={exportDone}
      />
      <JupyterLiteSandboxCard />

      <div className="dmc-card" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold dmc-title">Feedback</h3>
          {!hasSubmittedFeedback ? (
            <button type="button" className="dmc-button-primary" onClick={() => setFeedbackModalOpen(true)}>
              Leave feedback
            </button>
          ) : null}
        </div>
        <div className="dmc-card-body">
          <p className="text-sm dmc-subtitle">
            Tell us how helpful this platform is for your learning. Your rating helps improve future features.
          </p>
          {hasSubmittedFeedback && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 text-sm mt-3">
              Feedback already submitted. Thank you.
            </div>
          )}
          {feedbackSent && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm mt-3">
              Thanks! Your feedback was sent.
            </div>
          )}
        </div>
      </div>

      <div className="dmc-card mt-8 mb-10">
        <div className="dmc-card-header flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold dmc-title">Performance Analysis</h3>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={loadingFeedback}
            className="dmc-button-primary disabled:opacity-60"
          >
            {loadingFeedback ? 'Analyzing…' : 'Analyze my progress'}
          </button>
        </div>
        <div className="dmc-card-body space-y-3">
          <p className="text-sm dmc-subtitle">
            Get a short, personalized summary of your strengths and what to focus on next.
          </p>

          {feedbackError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {feedbackError}
            </div>
          )}

          {feedback?.feedbackText && (
            <div className="rounded-xl border border-slate-200 dmc-surface-soft p-4 space-y-3">
              <p className="text-sm dmc-title whitespace-pre-wrap leading-relaxed">{feedback.feedbackText}</p>
              {(feedback.strengths?.length || feedback.focusTopics?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="font-semibold dmc-title mb-1">Strengths</div>
                    <div className="dmc-subtitle">{(feedback.strengths || []).join(', ') || '—'}</div>
                  </div>
                  <div>
                    <div className="font-semibold dmc-title mb-1">Focus next</div>
                    <div className="dmc-subtitle">{(feedback.focusTopics || []).join(', ') || '—'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="features-grid">
        <Link to={CALCULATOR_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-calculator"></i></div>
          <div className="content">
            <h3>Practice with Calculators</h3>
            <p>Master concepts with interactive tools for all major topics.</p>
          </div>
        </Link>

        <Link to={MATH_ROADMAP_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-route"></i></div>
          <div className="content">
            <h3>Math Roadmap</h3>
            <p>Explore learning paths across foundations and specialized domains.</p>
          </div>
        </Link>

        <Link to={TRACKS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-layer-group"></i></div>
          <div className="content">
            <h3>Subject Tracks</h3>
            <p>Discover upcoming subjects and plan your learning journey.</p>
          </div>
        </Link>

        <Link to={USER_PRACTICE_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-wand-magic-sparkles"></i></div>
          <div className="content">
            <h3>AI-Powered Practice</h3>
            <p>Get personalized problems with instant feedback from AI.</p>
          </div>
        </Link>

        <Link to={USER_PROFILE_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-id-badge"></i></div>
          <div className="content">
            <h3>My Profile</h3>
            <p>Update your information and learning goals.</p>
          </div>
        </Link>

        <Link to={USER_SETTINGS_PATH} className="feature-card">
          <div className="icon"><i className="fas fa-sliders"></i></div>
          <div className="content">
            <h3>Preferences</h3>
            <p>Customize your learning experience and notifications.</p>
          </div>
        </Link>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => {
          if (!feedbackSubmitting) {
            setFeedbackModalOpen(false);
            setFeedbackSubmitError('');
          }
        }}
        onSubmit={onSubmitFeedback}
        submitting={feedbackSubmitting}
        serverError={feedbackSubmitError}
      />
    </div>
  );
}
