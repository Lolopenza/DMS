import { isCatalogSubjectImplemented, loadCatalogSubjectModule, getCatalogSubjects } from '../../../catalog/subjectCatalog.js';

// Backwards-compatible API used by SubjectRouter.

export function isSubjectImplemented(subjectSlug) {
  return isCatalogSubjectImplemented(subjectSlug);
}

export function getModuleSlugsBySubject(subjectSlug) {
  const subj = getCatalogSubjects().find((s) => s.slug === subjectSlug);
  if (!subj) return [];
  return (subj.modules || []).map((m) => m.slug);
}

export function getKnownModuleSlugs() {
  const all = getCatalogSubjects().flatMap((s) => (s.modules || []).map((m) => m.slug));
  return Array.from(new Set(all));
}

export async function loadSubjectModule(subjectSlug, moduleSlug) {
  try {
    return await loadCatalogSubjectModule(subjectSlug, moduleSlug);
  } catch (error) {
    // Don't mask evaluation/import errors as "Module not found" in UI.
    // SubjectRouter will render the real message from this thrown error.
    console.error(`Failed to load module ${subjectSlug}/${moduleSlug}:`, error);
    throw error;
  }
}
