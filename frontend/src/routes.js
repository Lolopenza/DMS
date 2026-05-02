// Single source of truth for platform routing metadata.
// Used by: Layout, Calculator, Hub, Roadmap, App route definitions and redirects.

export const DEFAULT_SUBJECT = 'discrete-math';
import { getCatalogSubjects, getCatalogModules } from './catalog/subjectCatalog.js';

export const SUBJECTS = [
  {
    slug: 'discrete-math',
    label: 'Discrete Mathematics',
    classification: 'foundation',
    goal: 'Foundational gateway: understand abstract objects and core structures.',
    status: 'active',
    calculatorPath: '/discrete-math/calculator',
    features: {
      calculator: true,
      roadmap: true,
      videos: false,
    },
  },
  {
    slug: 'linear-algebra',
    label: 'Linear Algebra',
    classification: 'specialized',
    goal: 'Spatial and matrix computation for graphics, optimization, and ML.',
    status: 'active',
    calculatorPath: '/linear-algebra/calculator',
    features: {
      calculator: true,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'probability-statistics',
    label: 'Probability & Statistics',
    classification: 'specialized',
    goal: 'Work with uncertainty and data for analytics and machine learning.',
    status: 'active',
    calculatorPath: '/probability-statistics/calculator',
    features: {
      calculator: true,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'algorithms',
    label: 'Algorithms & Data Structures',
    classification: 'specialized',
    goal: 'Design fast code with complexity-aware and step-by-step problem solving.',
    status: 'active',
    calculatorPath: '/algorithms/calculator',
    features: {
      calculator: true,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'it-logic',
    label: 'Logic & Computation',
    classification: 'specialized',
    goal: 'Deep formal logic for systems, compilers, and finite-state computation.',
    status: 'active',
    calculatorPath: '/it-logic/calculator',
    features: {
      calculator: true,
      roadmap: false,
      videos: false,
    },
  },
];

export function getSubjectBasePath(subjectSlug = DEFAULT_SUBJECT) {
  return `/${subjectSlug}`;
}

export const SUBJECT_BASE_PATH = getSubjectBasePath(DEFAULT_SUBJECT);
export const CALCULATOR_PATH = `${SUBJECT_BASE_PATH}/calculator`;
export const ROADMAP_PATH = `${SUBJECT_BASE_PATH}/roadmap`;
export const MATH_ROADMAP_PATH = '/math-roadmap';
export const TRACKS_PATH = '/tracks';
export const HOME_PATH = '/';
export const AUTH_SIGN_IN_PATH = '/auth/sign-in';
export const AUTH_SIGN_UP_PATH = '/auth/sign-up';
export const AUTH_RESET_PATH = '/auth/reset';
export const USER_DASHBOARD_PATH = '/user/dashboard';
export const USER_ACHIEVEMENTS_PATH = '/user/achievements';
export const USER_PRACTICE_PATH = '/user/practice';
export const USER_GENERATED_PRACTICE_PATH = '/user/practice/generated';
export const USER_PROFILE_PATH = '/user/profile';
export const USER_SETTINGS_PATH = '/user/settings';
export const USER_SANDBOX_PATH = '/user/sandbox';
export const ADMIN_CONTENT_PATH = '/admin/content';
export const HELP_PATH = '/help';
export const LEGAL_TERMS_PATH = '/legal/terms';
export const LEGAL_PRIVACY_PATH = '/legal/privacy';
export const LEGAL_COOKIES_PATH = '/legal/cookies';

export const CORE_ROUTES = [
  {
    key: 'home',
    path: HOME_PATH,
    label: 'Home',
    icon: 'fa-home',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
  },
  {
    key: 'tracks',
    path: TRACKS_PATH,
    label: 'Tracks',
    icon: 'fa-layer-group',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'minimal',
  },
  {
    key: 'calculator',
    path: CALCULATOR_PATH,
    label: 'All sections',
    icon: 'fa-th-large',
    requiresAuth: false,
    showInTopNav: true,
    showInFooter: false,
    navMode: 'full',
  },
  {
    key: 'roadmap',
    path: ROADMAP_PATH,
    label: 'Roadmap',
    icon: 'fa-route',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'minimal',
  },
  {
    key: 'auth-sign-in',
    path: AUTH_SIGN_IN_PATH,
    label: 'Sign in',
    icon: 'fa-right-to-bracket',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'auth-sign-up',
    path: AUTH_SIGN_UP_PATH,
    label: 'Sign up',
    icon: 'fa-user-plus',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'auth-reset',
    path: AUTH_RESET_PATH,
    label: 'Reset password',
    icon: 'fa-key',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'user-dashboard',
    path: USER_DASHBOARD_PATH,
    label: 'Dashboard',
    icon: 'fa-gauge',
    requiresAuth: true,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'user-profile',
    path: USER_PROFILE_PATH,
    label: 'Profile',
    icon: 'fa-id-badge',
    requiresAuth: true,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'user-settings',
    path: USER_SETTINGS_PATH,
    label: 'Settings',
    icon: 'fa-sliders',
    requiresAuth: true,
    showInTopNav: false,
    showInFooter: false,
    navMode: 'minimal',
    status: 'planned',
  },
  {
    key: 'help',
    path: HELP_PATH,
    label: 'Help Center',
    icon: 'fa-circle-question',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'full',
  },
  {
    key: 'legal-terms',
    path: LEGAL_TERMS_PATH,
    label: 'Terms of use',
    icon: 'fa-file-contract',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'full',
  },
  {
    key: 'legal-privacy',
    path: LEGAL_PRIVACY_PATH,
    label: 'Privacy policy',
    icon: 'fa-user-shield',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'full',
  },
  {
    key: 'legal-cookies',
    path: LEGAL_COOKIES_PATH,
    label: 'Cookie policy',
    icon: 'fa-cookie-bite',
    requiresAuth: false,
    showInTopNav: false,
    showInFooter: true,
    navMode: 'full',
  },
];

export function getSectionSeedForSubject(subjectSlug = DEFAULT_SUBJECT) {
  return getCatalogModules(subjectSlug) || [];
}

/** Public blurb for track cards: API may use `description`, static catalog uses `goal`. */
export function getTrackCardBlurb(track) {
  const text = [track?.description, track?.goal].find((s) => typeof s === 'string' && s.trim());
  if (text) return text.trim();
  const n = track?.sectionsCount ?? 0;
  if (n > 0) {
    return `${n} module${n === 1 ? '' : 's'} — open the track to practice and browse the catalog.`;
  }
  const label = track?.label || 'This';
  return `${label} track will list modules here when the workspace is ready.`;
}

export function getSubjectCatalog() {
  const catalog = getCatalogSubjects();
  return catalog.map((subject) => {
    const sections = getSectionSeedForSubject(subject.slug);
    const featureFlags = subject.features || {};
    return {
      ...subject,
      subjectPath: getSubjectBasePath(subject.slug),
      sectionsCount: sections.length,
      hasCalculator: sections.length > 0,
      calculatorPath: sections.length > 0 ? `${getSubjectBasePath(subject.slug)}/calculator` : null,
      roadmapPath: sections.length > 0 ? `${getSubjectBasePath(subject.slug)}/roadmap` : null,
      features: {
        calculator: Boolean(featureFlags.calculator),
        roadmap: Boolean(featureFlags.roadmap),
        videos: Boolean(featureFlags.videos),
      },
    };
  });
}

export function buildSectionsForSubject(subjectSlug = DEFAULT_SUBJECT) {
  const subjectBasePath = getSubjectBasePath(subjectSlug);
  return getSectionSeedForSubject(subjectSlug).map((s) => ({
    ...s,
    // Canonical module URL: /{subject}/{moduleSlug}
    path: `${subjectBasePath}/${s.slug}`,
    legacyPath: `${subjectBasePath}/modules/${s.slug}`,
    requiresAuth: Boolean(s.requiresAuth),
    showInTopNav: true,
    showInFooter: true,
    navMode: 'full',
  }));
}

export const SECTIONS = buildSectionsForSubject(DEFAULT_SUBJECT);

export function resolveSubjectSlug(pathname = '') {
  for (const subject of SUBJECTS) {
    if (pathname === `/${subject.slug}` || pathname.startsWith(`/${subject.slug}/`)) {
      return subject.slug;
    }
  }
  return DEFAULT_SUBJECT;
}

const MINIMAL_NAV_PATHS = new Set(CORE_ROUTES.filter((route) => route.navMode === 'minimal').map((route) => route.path));

export function isMinimalNavPath(pathname) {
  return MINIMAL_NAV_PATHS.has(pathname);
}

export function getTopNavItems(subjectSlug = DEFAULT_SUBJECT) {
  const sections = buildSectionsForSubject(subjectSlug);
  const sectionItems = sections.map(({ path, icon, label, requiresAuth }) => ({
    path,
    icon,
    label,
    requiresAuth,
  }));

  const calculatorEntry = CORE_ROUTES.find((route) => route.key === 'calculator');
  if (!calculatorEntry) return sectionItems;

  return [
    ...sectionItems,
    {
      path: `${getSubjectBasePath(subjectSlug)}/calculator`,
      icon: calculatorEntry.icon,
      label: calculatorEntry.label,
      requiresAuth: calculatorEntry.requiresAuth,
      isSectionsEntry: true,
    },
  ];
}

export function getFooterLinkGroups(subjectSlug = DEFAULT_SUBJECT) {
  const sections = buildSectionsForSubject(subjectSlug);
  const quickLinks = sections.slice(0, 4).map(({ path, icon, label }) => ({ path, icon, label }));
  const toolLinks = sections.slice(4).map(({ path, icon, label }) => ({ path, icon, label }));

  return {
    quickLinks,
    toolLinks,
  };
}
