const PROGRESS_PREFIX = 'mlp-module-progress';

function progressKey(subject, moduleSlug) {
  return `${PROGRESS_PREFIX}:${subject}:${moduleSlug}`;
}

export function getModuleProgress(subject, moduleSlug) {
  if (!subject || !moduleSlug || typeof window === 'undefined') {
    return { theory: false, videos: false, calculator: false };
  }

  try {
    const raw = window.localStorage.getItem(progressKey(subject, moduleSlug));
    if (!raw) return { theory: false, videos: false, calculator: false };
    const parsed = JSON.parse(raw);
    return {
      theory: Boolean(parsed.theory),
      videos: Boolean(parsed.videos),
      calculator: Boolean(parsed.calculator),
    };
  } catch {
    return { theory: false, videos: false, calculator: false };
  }
}

export function markModuleProgress(subject, moduleSlug, mode) {
  if (!subject || !moduleSlug || !mode || typeof window === 'undefined') return;
  if (!['theory', 'videos', 'calculator'].includes(mode)) return;

  const current = getModuleProgress(subject, moduleSlug);
  const next = { ...current, [mode]: true };
  try {
    window.localStorage.setItem(progressKey(subject, moduleSlug), JSON.stringify(next));
  } catch {
    // Ignore storage errors for private modes / quota constraints.
  }
}
