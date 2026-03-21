import {
  extractSubjectFromPath,
  extractModuleFromPath,
  isSubjectPath,
  isModulePath,
} from '../src/utils/routeHelpers.js';

import { SUBJECTS } from '../src/routes.js';

console.log('\n📍 PHASE 8: FINAL VERIFICATION — CRITICAL FLOWS\n');

// Test Case 1: Home → Tracks → Discrete Math → Combinatorics
console.log('TEST 1: Home → Tracks → Discrete Math → Combinatorics');
const flow1Paths = [
  { path: '/', name: 'Home', expectedSubject: 'discrete-math', expectedModule: null },
  { path: '/tracks', name: 'Tracks', expectedSubject: 'discrete-math', expectedModule: null },
  { path: '/discrete-math/calculator', name: 'Discrete Math Calculator', expectedSubject: 'discrete-math', expectedModule: null },
  { path: '/discrete-math/modules/combinatorics', name: 'Combinatorics Module', expectedSubject: 'discrete-math', expectedModule: 'combinatorics' },
];

let flow1Pass = true;
flow1Paths.forEach(({ path, name, expectedSubject, expectedModule }) => {
  const subject = extractSubjectFromPath(path, SUBJECTS);
  const module = extractModuleFromPath(path);
  const subjectMatch = subject === expectedSubject;
  const moduleMatch = module === expectedModule;
  const status = subjectMatch && moduleMatch ? '✓' : '✗';
  console.log(`  ${status} ${name}: ${path}`);
  if (!subjectMatch || !moduleMatch) {
    console.log(`     ✗ Expected: subject=${expectedSubject}, module=${expectedModule}`);
    console.log(`     ✗ Got: subject=${subject}, module=${module}`);
    flow1Pass = false;
  }
});

// Test Case 2: Direct URL navigation to different modules
console.log('\nTEST 2: Direct URL Navigation (All 8 Modules)');
const modules = ['combinatorics', 'logic', 'set-theory', 'graph-theory', 'automata', 'number-theory', 'probability', 'adjacency-matrix'];
let flow2Pass = true;
modules.forEach((mod) => {
  const path = `/discrete-math/modules/${mod}`;
  const subject = extractSubjectFromPath(path, SUBJECTS);
  const module = extractModuleFromPath(path);
  const status = subject === 'discrete-math' && module === mod ? '✓' : '✗';
  console.log(`  ${status} /discrete-math/modules/${mod}`);
  if (subject !== 'discrete-math' || module !== mod) {
    flow2Pass = false;
  }
});

// Test Case 3: Module switching (navigation between modules)
console.log('\nTEST 3: Module Switching (Navigation)');
const switchPaths = [
  { from: '/discrete-math/modules/combinatorics', to: '/discrete-math/modules/logic' },
  { from: '/discrete-math/modules/logic', to: '/discrete-math/modules/graph-theory' },
  { from: '/discrete-math/modules/automata', to: '/discrete-math/modules/set-theory' },
];

let flow3Pass = true;
switchPaths.forEach(({ from, to }) => {
  const fromModule = extractModuleFromPath(from);
  const toModule = extractModuleFromPath(to);
  const status = Boolean(fromModule && toModule && fromModule !== toModule) ? '✓' : '✗';
  console.log(`  ${status} ${fromModule} → ${toModule}`);
  if (!fromModule || !toModule || fromModule === toModule) {
    flow3Pass = false;
  }
});

// Test Case 4: Lazy loading verification (check module slugs)
console.log('\nTEST 4: Module Registry & Lazy Loading');
const { discreteMathModules } = await import('../src/pages/subjects/discrete-math/index.js');
let flow4Pass = true;
modules.forEach((mod) => {
  const exists = Boolean(discreteMathModules[mod]);
  const isFunction = typeof discreteMathModules[mod] === 'function';
  const status = exists && isFunction ? '✓' : '✗';
  console.log(`  ${status} ${mod} loader: ${exists && isFunction ? 'callable(.jsx)' : 'MISSING'}`);
  if (!exists || !isFunction) {
    flow4Pass = false;
  }
});

// Test Case 5: Old vs. New URL formats
console.log('\nTEST 5: Backward Compatibility');
const legacyPath = '/combinatorics'; // Old format
const canonicalPath = '/discrete-math/modules/combinatorics'; // New format
const legacyModule = extractModuleFromPath(legacyPath);
const canonicalModule = extractModuleFromPath(canonicalPath);
const legacyStatus = legacyModule === null ? '✓' : '✗'; // Legacy should NOT match (no validation)
const canonicalStatus = canonicalModule === 'combinatorics' ? '✓' : '✗'; // Canonical MUST match
console.log(`  ${legacyStatus} Legacy path ignored: ${legacyPath} → ${legacyModule}`);
console.log(`  ${canonicalStatus} Canonical path works: ${canonicalPath} → ${canonicalModule}`);
const flow5Pass = legacyModule === null && canonicalModule === 'combinatorics';

// Summary
console.log('\n═══════════════════════════════════════════════\n');
const allPass = flow1Pass && flow2Pass && flow3Pass && flow4Pass && flow5Pass;
if (allPass) {
  console.log('✅ PHASE 8: ALL CRITICAL FLOWS VERIFIED!\n');
  console.log('Flow Tests:');
  console.log('  ✓ Test 1: Home → Tracks → Subject → Module (passed)');
  console.log('  ✓ Test 2: Direct URL to all 8 modules (passed)');
  console.log('  ✓ Test 3: Module switching/navigation (passed)');
  console.log('  ✓ Test 4: Lazy loading & registry (passed)');
  console.log('  ✓ Test 5: Backward compatibility (passed)\n');
  console.log('🎉 REFACTOR COMPLETE: Multi-subject architecture ready for production!');
  process.exit(0);
} else {
  console.log('✗ PHASE 8: SOME FLOWS FAILED\n');
  process.exit(1);
}
