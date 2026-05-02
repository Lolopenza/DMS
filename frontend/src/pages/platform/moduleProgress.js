const PROGRESS_PREFIX = 'mlp-module-progress';

function progressKey(subject, moduleSlug) {
  return `${PROGRESS_PREFIX}:${subject}:${moduleSlug}`;
}

export function getModuleProgress(subject, moduleSlug) {
  if (!subject || !moduleSlug || typeof window === 'undefined') {
    return { visited: false };
  }

  try {
    const raw = window.localStorage.getItem(progressKey(subject, moduleSlug));
    if (!raw) return { visited: false };
    const parsed = JSON.parse(raw);
    const visited = Boolean(
      parsed.visited
      || parsed.theory
      || parsed.videos
      || parsed.calculator,
    );
    return { visited };
  } catch {
    return { visited: false };
  }
}

/** Mark the unified module page as visited (theory + practice on one URL). */
export function markModuleProgress(subject, moduleSlug) {
  if (!subject || !moduleSlug || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(progressKey(subject, moduleSlug), JSON.stringify({ visited: true }));
  } catch {
    // Ignore storage errors for private modes / quota constraints.
  }
}
