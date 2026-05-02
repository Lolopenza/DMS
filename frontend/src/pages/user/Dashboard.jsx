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
import HeroSection from '../../components/dashboard/HeroSection.jsx';
import OnboardingWizard from '../../components/dashboard/OnboardingWizard.jsx';
import LearningJourneyCard from '../../components/dashboard/LearningJourneyCard.jsx';
import SmartRecommendations from '../../components/dashboard/SmartRecommendations.jsx';
import SubjectProgressOverview from '../../components/dashboard/SubjectProgressOverview.jsx';
import { Button, Card, CardHeader } from '../../components/ui/index.js';
import useUserSkills from '../../hooks/useUserSkills.js';
import useGamification from '../../hooks/useGamification.js';
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
  const { skills, loading: skillsLoading, error: skillsError, overallPercent, totalAttempts, tier } = useUserSkills();
  const gamification = useGamification();

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

  const showOnboarding = tier === 'beginner' && totalAttempts < 5;
  const showAdvancedAnalytics = tier !== 'beginner' || totalAttempts >= 8;

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
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="sr-only">
          <h1>Learner dashboard</h1>
        </header>

        <HeroSection displayName={displayName} tier={tier} gamification={gamification} />

        <SkillMasteryDashboard skills={skills} loading={skillsLoading} error={skillsError} />

        {showOnboarding ? <OnboardingWizard /> : null}

        <LearningJourneyCard />

        <SmartRecommendations />

        <SubjectProgressOverview />

        <StudentMiniLab defaultCollapsed />

        {showAdvancedAnalytics ? (
          <>
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
          </>
        ) : null}

        <Card variant="elevated" padding="lg" className="mt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <CardHeader
              title="Feedback"
              subtitle="Tell us how helpful this platform is for your learning. Your rating helps improve future features."
            />
            {!hasSubmittedFeedback ? (
              <Button variant="secondary" onClick={() => setFeedbackModalOpen(true)}>
                Leave feedback
              </Button>
            ) : null}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            {hasSubmittedFeedback ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                Feedback already submitted. Thank you.
              </div>
            ) : null}
            {feedbackSent ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                Thanks! Your feedback was sent.
              </div>
            ) : null}
          </div>
        </Card>

        {showAdvancedAnalytics ? (
          <Card variant="elevated" padding="lg" className="mt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <CardHeader
                title="Performance analysis"
                subtitle="Get a short, personalized summary of your strengths and what to focus on next."
              />
              <Button loading={loadingFeedback} loadingLabel="Analyzing..." onClick={onAnalyze}>
                Analyze my progress
              </Button>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {feedbackError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                  {feedbackError}
                </div>
              ) : null}

              {feedback?.feedbackText ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                    {feedback.feedbackText}
                  </p>
                  {feedback.strengths?.length || feedback.focusTopics?.length ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Strengths
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                          {(feedback.strengths || []).join(', ') || '—'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Focus next
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                          {(feedback.focusTopics || []).join(', ') || '—'}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg" className="mt-8 border-indigo-100 dark:border-indigo-900/40">
            <CardHeader
              title="Performance analysis"
              subtitle="Unlocks after more practice — complete a few sessions to enable personalized AI summaries and exports."
            />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Overall mastery: <strong>{overallPercent}%</strong> · attempts logged: <strong>{totalAttempts}</strong>
            </p>
          </Card>
        )}

        <section className="mt-10 pb-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Quick actions" subtitle="Jump back into practice and account tools." />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  to: CALCULATOR_PATH,
                  icon: 'fa-calculator',
                  title: 'Practice with Calculators',
                  desc: 'Master concepts with interactive tools.',
                },
                {
                  to: MATH_ROADMAP_PATH,
                  icon: 'fa-route',
                  title: 'Math Roadmap',
                  desc: 'Explore learning paths and milestones.',
                },
                { to: TRACKS_PATH, icon: 'fa-layer-group', title: 'Subject Tracks', desc: 'Discover subjects and module catalogs.' },
                {
                  to: USER_PRACTICE_PATH,
                  icon: 'fa-wand-magic-sparkles',
                  title: 'AI-Powered Practice',
                  desc: 'Personalized problems with feedback.',
                },
                { to: USER_PROFILE_PATH, icon: 'fa-id-badge', title: 'My Profile', desc: 'Update your information and goals.' },
                {
                  to: USER_SETTINGS_PATH,
                  icon: 'fa-sliders',
                  title: 'Preferences',
                  desc: 'Customize your learning experience.',
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none dark:hover:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
                      <i className={`fas ${item.icon}`} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </section>

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
    </section>
  );
}
