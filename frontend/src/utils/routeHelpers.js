/**
 * Route Helpers & Utilities
 * 
 * Used by Chatbot and other components to safely extract subject/module from URLs
 */

import { SUBJECTS, DEFAULT_SUBJECT } from '../routes.js';
import { getKnownModuleSlugs } from '../pages/subjects/_shared/subjectRegistry.js';

/**
 * Extract subject slug from pathname safely
 * Validates against SUBJECTS catalog
 * 
 * @param {string} pathname - URL path
 * @param {object[]} subjects - SUBJECTS catalog
 * @returns {string} validated subject slug or DEFAULT_SUBJECT
 */
export function extractSubjectFromPath(pathname, subjects = SUBJECTS) {
  if (!pathname) return DEFAULT_SUBJECT;

  // Try to match against all known subjects
  for (const subject of subjects) {
    const subjectPrefix = `/${subject.slug}/`;
    if (pathname.startsWith(subjectPrefix)) {
      return subject.slug;
    }
  }

  // Fallback to DEFAULT_SUBJECT if no match
  return DEFAULT_SUBJECT;
}

/**
 * Extract module slug from pathname
 * Handles format: /{subject}/modules/{module} or /{subject}/{module}
 * Only returns a slug if it's in the known modules list
 * 
 * @param {string} pathname - URL path
 * @returns {string|null} module slug or null
 */
export function extractModuleFromPath(pathname) {
  if (!pathname) return null;

  const knownModules = new Set(getKnownModuleSlugs());

  // Match new format: /{subject}/modules/{module}
  const newFormatMatch = pathname.match(/\/[^/]+\/modules\/([^/]+)/);
  if (newFormatMatch && knownModules.has(newFormatMatch[1])) {
    return newFormatMatch[1];
  }

  // Match old format: /{subject}/{module}
  // Only if it's a known module (to avoid matching /calculator, /roadmap, etc.)
  const oldFormatMatch = pathname.match(/\/[^/]+\/([^/]+)/);
  if (oldFormatMatch && knownModules.has(oldFormatMatch[1])) {
    return oldFormatMatch[1];
  }

  // Match legacy short format: /{module} (can be ambiguous, use only for short paths)
  if (!pathname.includes('/')) {
    const shortFormatMatch = pathname.match(/\/([^/]+)/);
    if (shortFormatMatch && knownModules.has(shortFormatMatch[1])) {
      return shortFormatMatch[1];
    }
  }

  return null;
}

/**
 * Check if pathname is within a known subject area
 * Useful for conditional rendering and guards
 * 
 * @param {string} pathname - URL path
 * @returns {boolean}
 */
export function isSubjectPath(pathname) {
  return extractSubjectFromPath(pathname) !== DEFAULT_SUBJECT || pathname.includes(DEFAULT_SUBJECT);
}

/**
 * Check if pathname is a module-specific page
 * 
 * @param {string} pathname - URL path
 * @returns {boolean}
 */
export function isModulePath(pathname) {
  return extractModuleFromPath(pathname) !== null;
}
