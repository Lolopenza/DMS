import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { buildSectionsForSubject } from '../../routes.js';
import { getModuleLearningContent } from './moduleContent.js';
import { markModuleProgress } from './moduleProgress.js';

const MODE_META = {
  theory: {
    title: 'Theory & Concepts',
    icon: 'fa-book-open',
    message: 'Theory pages are being prepared for this module. Use the interactive tool for now.',
  },
  videos: {
    title: 'Video Lectures',
    icon: 'fa-circle-play',
    message: 'Video playlists are planned for this module. Use the interactive tool in the meantime.',
  },
};

export default function ModuleModePlaceholder() {
  const { subject, module: moduleSlug, mode } = useParams();
  const moduleMeta = buildSectionsForSubject(subject).find((section) => section.slug === moduleSlug);
  const modeMeta = MODE_META[mode];

  useEffect(() => {
    document.body.classList.add('hub-page');
    return () => document.body.classList.remove('hub-page');
  }, []);

  if (!moduleMeta || !modeMeta) {
    return <Navigate to={`/${subject || ''}`} replace />;
  }

  const content = getModuleLearningContent(subject, moduleMeta);
  const isFlagship = subject === 'discrete-math';
  const hasVideoId = Boolean(moduleMeta.videoId);
  const videoEmbedUrl = hasVideoId ? `https://www.youtube.com/embed/${moduleMeta.videoId}` : null;
  const primaryVideoTitle = content.videos[0]?.title || `${moduleMeta.label}: Video lesson`;
  const backupVideoUrl = hasVideoId
    ? `https://www.youtube.com/watch?v=${moduleMeta.videoId}`
    : (content.videos[0]?.url || 'https://www.youtube.com');
  const isFallbackMode = mode === 'theory'
    ? content.meta?.isTheoryFallback
    : content.meta?.isVideosFallback;

  useEffect(() => {
    markModuleProgress(subject, moduleSlug, mode);
  }, [subject, moduleSlug, mode]);

  return (
    <main className="hub-main">
      <section className="platform-section module-breadcrumb-wrap" aria-label="Breadcrumb">
        <nav className="module-breadcrumb" aria-label="Module navigation path">
          <Link to="/tracks">Tracks</Link>
          <span>/</span>
          <Link to={`/${subject}`}>Module Catalog</Link>
          <span>/</span>
          <Link to={`/${subject}/${moduleSlug}`}>{moduleMeta.label}</Link>
          <span>/</span>
          <span>{modeMeta.title}</span>
        </nav>
      </section>

      <section className="platform-section" aria-label="Module learning mode">
        <div className="platform-info-card subject-scope-card">
          <div className="platform-info-icon"><i className={`fas ${modeMeta.icon}`}></i></div>
          <h2>{moduleMeta.label}: {modeMeta.title}</h2>

          {isFallbackMode ? (
            <div className="ui-state ui-state-info module-fallback-note" role="status">
              <h3><i className="fas fa-circle-info"></i> Curated summary mode</h3>
              <p className="ui-state-message">
                Этот модуль находится в разработке. Ознакомьтесь с теорией в основном треке Discrete Math.
              </p>
              {!isFlagship ? (
                <div className="platform-cta-actions">
                  <Link className="btn btn-outline" to="/discrete-math">
                    <i className="fas fa-graduation-cap"></i> Open Discrete Math flagship track
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {mode === 'theory' ? (
            <>
              <p className="subject-scope-goal">{content.theory.intro}</p>
              {content.theory.markdown ? (
                <div className="module-theory-block module-theory-markdown">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {content.theory.markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="module-theory-block">
                  <h3>Key Concepts</h3>
                  <ul>
                    {content.theory.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="subject-scope-goal">
                {isFlagship
                  ? 'Watch curated lessons and immediately continue hands-on in the calculator.'
                  : modeMeta.message}
              </p>
              {hasVideoId ? (
                <article className="module-video-card module-video-featured">
                  <div className="module-video-frame-wrap">
                    <iframe
                      className="module-video-frame"
                      src={videoEmbedUrl}
                      title={primaryVideoTitle}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <h3>{primaryVideoTitle}</h3>
                  <p>Open the source on YouTube if embedding is restricted in your browser.</p>
                  <a href={backupVideoUrl} target="_blank" rel="noreferrer" className="btn btn-outline module-video-link">
                    <i className="fas fa-arrow-up-right-from-square"></i> Open on YouTube
                  </a>
                </article>
              ) : (
                <div className="module-video-grid">
                  {content.videos.map((video) => (
                    <article key={video.title} className="module-video-card">
                      <div className="module-video-fallback-wrap">
                        <div className="platform-info-icon"><i className="fas fa-video"></i></div>
                        <p>Video lesson</p>
                        <span>Open on YouTube</span>
                      </div>
                      <h3>{video.title}</h3>
                      <p>Open the source list in a new tab for more materials.</p>
                      <a href={video.url} target="_blank" rel="noreferrer" className="btn btn-outline module-video-link">
                        <i className="fas fa-arrow-up-right-from-square"></i> Open on YouTube
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="platform-cta-actions module-mode-actions">
            <Link className="btn btn-primary" to={`/${subject}/${moduleSlug}/calculator`}>
              <i className="fas fa-calculator"></i> Open Interactive Calculator
            </Link>
            <Link className="btn btn-outline" to={`/${subject}/${moduleSlug}`}>
              <i className="fas fa-arrow-left"></i> Back to module dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
