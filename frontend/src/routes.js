// Single source of truth for platform routing metadata.
// Used by: Layout, Calculator, Hub, Roadmap, App route definitions and redirects.

export const DEFAULT_SUBJECT = 'discrete-math';
export const SUBJECTS = [
  {
    slug: 'discrete-math',
    label: 'Discrete Mathematics',
    classification: 'foundation',
    goal: 'Foundational gateway: understand abstract objects and core structures.',
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
    classification: 'specialized',
    goal: 'Spatial and matrix computation for graphics, optimization, and ML.',
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
    classification: 'specialized',
    goal: 'Work with uncertainty and data for analytics and machine learning.',
    status: 'active',
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
    desc: 'Count finite choices: factorials, permutations, and combinations.',
    videoId: 'VJkvPTY6kZw',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'probability',
    icon: 'fa-dice',
    label: 'Probability (Intro)',
    desc: 'Core probability fundamentals. Open the full Probability & Statistics track for the complete toolkit.',
    videoId: 'igXt9cX_nQs',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'graph-theory',
    icon: 'fa-project-diagram',
    label: 'Graph Theory (Intro)',
    desc: 'Graph structure basics: vertices, edges, adjacency, and degree.',
    videoId: 'ZQY4IfEcGvM',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'adjacency-matrix',
    icon: 'fa-th',
    label: 'Adjacency Matrix (Intro)',
    desc: 'Edit matrix representations and inspect graph properties.',
    videoId: '7AhHGp7EzZ8',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'set-theory',
    icon: 'fa-object-group',
    label: 'Set Theory',
    desc: 'Set operations, properties, and relation fundamentals.',
    videoId: '5ZhNmKb-dqk',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'number-theory',
    icon: 'fa-hashtag',
    label: 'Number Theory',
    desc: 'Integer fundamentals: GCD, primes, and modular arithmetic.',
    videoId: '-Qtl4nn7R4A',
    scope: 'intro',
    requiresAuth: false,
  },
  {
    slug: 'logic',
    icon: 'fa-brain',
    label: 'Logic (Intro)',
    desc: 'Intro concepts only. Open Logic & Computation for full truth-table and equivalence toolset.',
    videoId: 'itrXYg41-V0',
    scope: 'intro',
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
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'matrices',
      icon: 'fa-border-all',
      label: 'Matrices',
      desc: 'Matrix operations, rank, and inverse.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'linear-systems',
      icon: 'fa-equals',
      label: 'Linear Systems',
      desc: 'Solve systems of linear equations.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'determinants',
      icon: 'fa-table-cells-large',
      label: 'Determinants',
      desc: 'Determinant properties and computation.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'eigenvalues',
      icon: 'fa-wave-square',
      label: 'Eigenvalues',
      desc: 'Eigenvalues and eigenvectors basics.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'linear-transformations',
      icon: 'fa-shuffle',
      label: 'Linear Transformations',
      desc: 'Mappings, kernels, and image spaces.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'vector-spaces',
      icon: 'fa-vector-square',
      label: 'Vector Spaces',
      desc: 'Subspaces, basis, and dimension.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'orthogonality',
      icon: 'fa-draw-polygon',
      label: 'Orthogonality',
      desc: 'Inner products, projections, orthonormality.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
  ],
  'algorithms': [
    {
      slug: 'asymptotic-analysis',
      icon: 'fa-chart-line',
      label: 'Asymptotic Analysis',
      desc: 'Big O notation and complexity analysis.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'sorting',
      icon: 'fa-arrow-down-a-z',
      label: 'Sorting Algorithms',
      desc: 'Bubble, merge, and quick sort algorithms.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'searching',
      icon: 'fa-magnifying-glass',
      label: 'Searching Algorithms',
      desc: 'Linear and binary search with step-by-step execution.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'graph-algorithms',
      icon: 'fa-share-nodes',
      label: 'Graph Algorithms',
      desc: 'Algorithmic traversal and search (DFS/BFS), focused on step-by-step execution.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'dynamic-programming',
      icon: 'fa-puzzle-piece',
      label: 'Dynamic Programming',
      desc: 'Fibonacci, coin change, and optimization.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'greedy',
      icon: 'fa-bullseye',
      label: 'Greedy Algorithms',
      desc: 'Optimal substructure and greedy choice.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'divide-conquer',
      icon: 'fa-code-branch',
      label: 'Divide and Conquer',
      desc: 'Subdividing problems and combining solutions.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'string-algorithms',
      icon: 'fa-spell-check',
      label: 'String Algorithms',
      desc: 'Pattern matching and string processing.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
  ],
  'probability-statistics': [
    {
      slug: 'probability-basics',
      icon: 'fa-dice',
      label: 'Probability Basics',
      desc: 'Fundamental probability calculations and rules.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'conditional-probability',
      icon: 'fa-diagram-project',
      label: 'Conditional Probability',
      desc: 'Compute conditional and joint probabilities.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'bayes-theorem',
      icon: 'fa-scale-balanced',
      label: "Bayes' Theorem",
      desc: 'Posterior inference with priors and evidence.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'distributions',
      icon: 'fa-chart-area',
      label: 'Distributions',
      desc: 'Discrete distributions: Binomial, Poisson, and Geometric.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
  ],
  'it-logic': [
    {
      slug: 'automata',
      icon: 'fa-cogs',
      label: 'Automata (FSM)',
      desc: 'DFA and NFA simulation with state transitions.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'propositional-logic',
      icon: 'fa-brain',
      label: 'Advanced Propositional Logic',
      desc: 'Formal operators, formula analysis, and logical classification.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'truth-tables',
      icon: 'fa-table',
      label: 'Truth Tables',
      desc: 'Generate full truth tables for formulas.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'equivalence-laws',
      icon: 'fa-equals',
      label: 'Equivalence Laws',
      desc: 'Check equivalence across logical formulas.',
      scope: 'deep-dive',
      requiresAuth: false,
    },
    {
      slug: 'boolean-algebra',
      icon: 'fa-code-branch',
      label: 'Boolean Algebra',
      desc: 'Boolean simplification and operator identities.',
      scope: 'deep-dive',
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
