// Single source of truth for platform routing metadata.
// Used by: Layout, Calculator, Hub, Roadmap, App route definitions and redirects.

export const DEFAULT_SUBJECT = 'discrete-math';
export const SUBJECTS = [
  {
    slug: 'discrete-math',
    label: 'Discrete Mathematics',
    status: 'active',
    features: {
      calculator: true,
      roadmap: true,
      videos: false,
    },
  },
  {
    slug: 'linear-algebra',
    label: 'Linear Algebra',
    status: 'active',
    features: {
      calculator: true,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'probability-statistics',
    label: 'Probability & Statistics',
    status: 'planned',
    features: {
      calculator: false,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'algorithms',
    label: 'Algorithms',
    status: 'planned',
    features: {
      calculator: false,
      roadmap: false,
      videos: false,
    },
  },
  {
    slug: 'it-logic',
    label: 'Logic for IT',
    status: 'planned',
    features: {
      calculator: false,
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
export const TRACKS_PATH = '/tracks';
export const HOME_PATH = '/';
export const AUTH_SIGN_IN_PATH = '/auth/sign-in';
export const AUTH_SIGN_UP_PATH = '/auth/sign-up';
export const AUTH_RESET_PATH = '/auth/reset';
export const USER_DASHBOARD_PATH = '/user/dashboard';
export const USER_PROFILE_PATH = '/user/profile';
export const USER_SETTINGS_PATH = '/user/settings';
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

const sectionSeed = [
  {
    slug: 'combinatorics',
    icon: 'fa-cube',
    label: 'Combinatorics',
    desc: 'Permutations, combinations, counting.',
    requiresAuth: false,
  },
  {
    slug: 'probability',
    icon: 'fa-dice',
    label: 'Probability',
    desc: 'Probabilities, distributions, simulations.',
    requiresAuth: false,
  },
  {
    slug: 'graph-theory',
    icon: 'fa-project-diagram',
    label: 'Graph Theory',
    desc: 'Visualize graphs, run algorithms, explore properties.',
    requiresAuth: false,
  },
  {
    slug: 'adjacency-matrix',
    icon: 'fa-th',
    label: 'Adjacency Matrix',
    desc: 'Matrix editor, graph from matrix.',
    requiresAuth: false,
  },
  {
    slug: 'automata',
    icon: 'fa-cogs',
    label: 'Automata',
    desc: 'DFA, NFA — simulate and analyze.',
    requiresAuth: false,
  },
  {
    slug: 'set-theory',
    icon: 'fa-object-group',
    label: 'Set Theory',
    desc: 'Set operations and relations.',
    requiresAuth: false,
  },
  {
    slug: 'number-theory',
    icon: 'fa-hashtag',
    label: 'Number Theory',
    desc: 'GCD, primes, modular arithmetic.',
    requiresAuth: false,
  },
  {
    slug: 'logic',
    icon: 'fa-brain',
    label: 'Logic',
    desc: 'Truth tables, logical equivalence.',
    requiresAuth: false,
  },
];

const sectionCatalogBySubject = {
  'discrete-math': sectionSeed,
  'linear-algebra': [
    {
      slug: 'vectors',
      icon: 'fa-arrows-alt',
      label: 'Vectors',
      desc: 'Vector arithmetic and geometric operations.',
      requiresAuth: false,
    },
    {
      slug: 'matrices',
      icon: 'fa-border-all',
      label: 'Matrices',
      desc: 'Matrix operations, rank, and inverse.',
      requiresAuth: false,
    },
    {
      slug: 'linear-systems',
      icon: 'fa-equals',
      label: 'Linear Systems',
      desc: 'Solve systems of linear equations.',
      requiresAuth: false,
    },
    {
      slug: 'determinants',
      icon: 'fa-table-cells-large',
      label: 'Determinants',
      desc: 'Determinant properties and computation.',
      requiresAuth: false,
    },
    {
      slug: 'eigenvalues',
      icon: 'fa-wave-square',
      label: 'Eigenvalues',
      desc: 'Eigenvalues and eigenvectors basics.',
      requiresAuth: false,
    },
    {
      slug: 'linear-transformations',
      icon: 'fa-shuffle',
      label: 'Linear Transformations',
      desc: 'Mappings, kernels, and image spaces.',
      requiresAuth: false,
    },
    {
      slug: 'vector-spaces',
      icon: 'fa-vector-square',
      label: 'Vector Spaces',
      desc: 'Subspaces, basis, and dimension.',
      requiresAuth: false,
    },
    {
      slug: 'orthogonality',
      icon: 'fa-draw-polygon',
      label: 'Orthogonality',
      desc: 'Inner products, projections, orthonormality.',
      requiresAuth: false,
    },
  ],
};

export function getSectionSeedForSubject(subjectSlug = DEFAULT_SUBJECT) {
  return sectionCatalogBySubject[subjectSlug] || [];
}

export function getSubjectCatalog() {
  return SUBJECTS.map((subject) => {
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
    // Phase 2+: Using new canonical URL format with /modules/ prefix
    path: `${subjectBasePath}/modules/${s.slug}`,
    legacyPath: `/${s.slug}`,
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
