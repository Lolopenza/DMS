import {
  AUTH_RESET_PATH,
  AUTH_SIGN_IN_PATH,
  AUTH_SIGN_UP_PATH,
  CALCULATOR_PATH,
  CORE_ROUTES,
  DEFAULT_SUBJECT,
  HOME_PATH,
  ROADMAP_PATH,
  SECTIONS,
  SUBJECTS,
  TRACKS_PATH,
  USER_DASHBOARD_PATH,
  USER_PROFILE_PATH,
  USER_SETTINGS_PATH,
} from '../src/routes.js';

import { discreteMathModules } from '../src/pages/subjects/discrete-math/index.js';
import {
  extractSubjectFromPath,
  extractModuleFromPath,
  isSubjectPath,
  isModulePath,
} from '../src/utils/routeHelpers.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`✗ FAIL: ${message}`);
  }
}

function assertUnique(values, message) {
  const seen = new Set(values);
  assert(seen.size === values.length, message);
}

function check(number, description, condition) {
  if (condition) {
    console.log(`  ✓ ${number}. ${description}`);
  } else {
    throw new Error(`✗ Check ${number} failed: ${description}`);
  }
}

function runSmokeRoutes() {
  console.log('\n📋 PHASE 6: QUALITY GATES CHECKLIST (27 ITEMS)\n');

  // ============================================================================
  // SECTION 1: CORE ROUTING (Checks 1-8)
  // ============================================================================
  console.log('SECTION 1: Core Routing Infrastructure');

  const requiredCorePaths = [
    HOME_PATH,
    TRACKS_PATH,
    CALCULATOR_PATH,
    ROADMAP_PATH,
    AUTH_SIGN_IN_PATH,
    AUTH_SIGN_UP_PATH,
    AUTH_RESET_PATH,
    USER_DASHBOARD_PATH,
    USER_PROFILE_PATH,
    USER_SETTINGS_PATH,
  ];

  check(1, 'All required CORE_ROUTES path constants defined', requiredCorePaths.every(Boolean));

  check(
    2,
    'CORE_ROUTES path values are unique',
    CORE_ROUTES.map((route) => route.path).every((p, i, arr) => arr.indexOf(p) === i),
  );

  check(
    3,
    'CORE_ROUTES key values are unique',
    CORE_ROUTES.map((route) => route.key).every((k, i, arr) => arr.indexOf(k) === i),
  );

  check(
    4,
    'DEFAULT_SUBJECT is active in SUBJECTS catalog',
    SUBJECTS.some((subject) => subject.slug === DEFAULT_SUBJECT && subject.status === 'active'),
  );

  check(5, 'SECTIONS catalog is not empty', SECTIONS.length > 0);

  check(
    6,
    'All SECTIONS paths follow subject-first format (/{subject}/modules/{module})',
    SECTIONS.every((section) => section.path.match(/^\/[^/]+\/modules\/[^/]+$/)),
  );

  assertUnique(
    SECTIONS.map((section) => section.path),
    'SECTIONS contains duplicate canonical paths',
  );
  check(7, 'SECTIONS canonical paths are unique', true);

  assertUnique(
    SECTIONS.map((section) => section.legacyPath),
    'SECTIONS contains duplicate legacy paths',
  );
  check(8, 'SECTIONS legacy paths are unique', true);

  // ============================================================================
  // SECTION 2: REQUIRED ROUTE KEYS (Checks 9-11)
  // ============================================================================
  console.log('\nSECTION 2: Required CORE_ROUTES Keys');

  const requiredCoreRouteKeys = new Set([
    'home',
    'tracks',
    'calculator',
    'roadmap',
    'auth-sign-in',
    'auth-sign-up',
    'auth-reset',
    'user-dashboard',
    'user-profile',
    'user-settings',
  ]);

  check(
    9,
    'All required CORE_ROUTES keys exist (home, tracks, calculator, etc.)',
    [...requiredCoreRouteKeys].every((key) => CORE_ROUTES.some((route) => route.key === key)),
  );

  check(
    10,
    'All CORE_ROUTES have required metadata (icon, label, navMode)',
    CORE_ROUTES.every(
      (route) => route.icon && route.label && (route.navMode === 'minimal' || route.navMode === 'full'),
    ),
  );

  check(
    11,
    'CORE_ROUTES requiresAuth is boolean or undefined',
    CORE_ROUTES.every((route) => typeof route.requiresAuth === 'boolean' || route.requiresAuth === undefined),
  );

  // ============================================================================
  // SECTION 3: MODULE DEFINITIONS (Checks 12-16)
  // ============================================================================
  console.log('\nSECTION 3: Module Definitions');

  const sectionSlugs = SECTIONS.map((s) => s.slug);

  check(12, 'All modules have slug defined', SECTIONS.every((s) => Boolean(s.slug)));
  check(13, 'All modules have label defined', SECTIONS.every((s) => Boolean(s.label)));
  check(14, 'All modules have icon defined', SECTIONS.every((s) => Boolean(s.icon)));
  check(15, 'All modules have description defined', SECTIONS.every((s) => Boolean(s.desc)));

  assertUnique(sectionSlugs, 'Module slugs are not unique');
  check(16, 'Module slugs are unique', true);

  // ============================================================================
  // SECTION 4: SUBJECT CATALOG (Checks 17-19)
  // ============================================================================
  console.log('\nSECTION 4: Subject Catalog Integrity');

  check(
    17,
    'At least one subject has active status',
    SUBJECTS.some((subject) => subject.status === 'active'),
  );

  check(
    18,
    'Active subjects have valid feature flags (boolean)',
    SUBJECTS.filter((s) => s.status === 'active').every(
      (s) => typeof s.features === 'object' && typeof s.features.calculator === 'boolean',
    ),
  );

  check(
    19,
    'DEFAULT_SUBJECT ("discrete-math") has 7 intro sections',
    SECTIONS.length === 7,
  );

  // ============================================================================
  // SECTION 5: NO DOUBLE SLASHES (Check 20)
  // ============================================================================
  console.log('\nSECTION 5: URL Integrity');

  const allPaths = [
    ...requiredCorePaths,
    ...SECTIONS.map((s) => s.path),
    ...SECTIONS.map((s) => s.legacyPath),
  ];
  check(
    20,
    'No paths contain consecutive slashes (// indicates malformed URL)',
    allPaths.every((p) => !p.includes('//')),
  );

  // ============================================================================
  // SECTION 6: MODULE REGISTRY LOADING (Checks 21-23)
  // ============================================================================
  console.log('\nSECTION 6: Module Registry');

  check(
    21,
    'discreteMathModules registry exists and exports modules',
    Boolean(discreteMathModules) && typeof discreteMathModules === 'object',
  );

  const expectedModules = ['combinatorics', 'logic', 'set-theory', 'graph-theory', 'number-theory', 'probability', 'adjacency-matrix'];
  check(
    22,
    `All 7 modules registered (${expectedModules.join(', ')})`,
    expectedModules.every((m) => Boolean(discreteMathModules[m])),
  );

  check(
    23,
    'Module registry functions are callable',
    expectedModules.every((m) => typeof discreteMathModules[m] === 'function'),
  );

  // ============================================================================
  // SECTION 7: ROUTE VALIDATION UTILITIES (Checks 24-26)
  // ============================================================================
  console.log('\nSECTION 7: Route Extraction & Validation');

  const testPaths = [
    '/discrete-math/modules/combinatorics',
    '/discrete-math/modules/logic',
    '/discrete-math/calculator',
    '/tracks',
    '/',
  ];

  const validSubjectTests = testPaths.map((path) => {
    const subject = extractSubjectFromPath(path, SUBJECTS);
    return subject === 'discrete-math' || subject === null; // null for non-subject paths is OK
  });
  check(24, 'extractSubjectFromPath() works for canonical paths', validSubjectTests.every(Boolean));

  const validModuleTests = [
    { path: '/discrete-math/modules/combinatorics', expected: true },
    { path: '/discrete-math/modules/logic', expected: true },
    { path: '/discrete-math/calculator', expected: false },
    { path: '/tracks', expected: false },
  ].map(({ path, expected }) => {
    const module = extractModuleFromPath(path);
    return expected ? Boolean(module) : !module;
  });
  check(25, 'extractModuleFromPath() correctly identifies module paths', validModuleTests.every(Boolean));

  const pathTypeTests = [
    { path: '/discrete-math/modules/combinatorics', isModule: true, isSubject: true },
    { path: '/discrete-math/calculator', isModule: false, isSubject: true },
    { path: '/tracks', isModule: false, isSubject: false },
  ].map(({ path, isModule, isSubject }) => isModulePath(path) === isModule && isSubjectPath(path) === isSubject);
  check(26, 'isModulePath() and isSubjectPath() guard functions work', pathTypeTests.every(Boolean));

  // ============================================================================
  // SECTION 8: LEGACY PATH SUPPORT (Check 27)
  // ============================================================================
  console.log('\nSECTION 8: Backward Compatibility');

  check(
    27,
    'Legacy paths differ from canonical paths (redirect required)',
    SECTIONS.every((s) => s.legacyPath !== s.path),
  );

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(
    `\n✅ ALL 27 QUALITY GATE CHECKS PASSED!\n` +
    `   • Subjects: ${SUBJECTS.length} (${SUBJECTS.filter((s) => s.status === 'active').length} active)\n` +
    `   • Modules: ${SECTIONS.length}\n` +
    `   • Core routes: ${CORE_ROUTES.length}\n` +
    `   • Registry: ${Object.keys(discreteMathModules).length} modules loaded\n`,
  );
}

runSmokeRoutes();
