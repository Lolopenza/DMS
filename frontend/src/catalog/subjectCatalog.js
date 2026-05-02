import React from 'react';
import { Navigate } from 'react-router-dom';
import ModuleExperience from '../components/module/ModuleExperience.jsx';

/**
 * Canonical subject/module catalog.
 *
 * This file is the single source of truth for:
 * - What modules exist per subject
 * - How they are presented in Tracks/Workspace (label/desc/icon/scope)
 * - How they are loaded at runtime (dynamic import loader)
 * - Aliases/redirects to avoid URL breakage and duplication
 */

export const SUBJECT_CATALOG = [
  {
    slug: 'discrete-math',
    label: 'Discrete Mathematics',
    classification: 'foundation',
    goal: 'Foundational gateway: understand abstract objects and core structures.',
    status: 'active',
    features: { calculator: true, roadmap: true, videos: false },
    modules: [
      {
        slug: 'combinatorics',
        icon: 'fa-cube',
        label: 'Combinatorics',
        desc: 'Count finite choices: factorials, permutations, and combinations.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/combinatorics/Combinatorics.jsx'),
      },
      {
        slug: 'probability',
        icon: 'fa-dice',
        label: 'Probability (Intro)',
        desc: 'Core probability fundamentals. Open the full Probability & Statistics track for the complete toolkit.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/probability/Probability.jsx'),
      },
      {
        slug: 'graph-theory',
        icon: 'fa-project-diagram',
        label: 'Graph Theory (Intro)',
        desc: 'Graph structure basics: vertices, edges, adjacency, and degree.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/graph-theory/GraphTheory.jsx'),
      },
      {
        slug: 'adjacency-matrix',
        icon: 'fa-th',
        label: 'Adjacency Matrix (Intro)',
        desc: 'Edit matrix representations and inspect graph properties.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/adjacency-matrix/AdjacencyMatrix.jsx'),
      },
      {
        slug: 'set-theory',
        icon: 'fa-object-group',
        label: 'Set Theory',
        desc: 'Set operations, properties, and relation fundamentals.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/set-theory/SetTheory.jsx'),
      },
      {
        slug: 'number-theory',
        icon: 'fa-hashtag',
        label: 'Number Theory',
        desc: 'Integer fundamentals: GCD, primes, and modular arithmetic.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/number-theory/NumberTheory.jsx'),
      },
      {
        slug: 'logic',
        icon: 'fa-brain',
        label: 'Logic (Intro)',
        desc: 'Intro concepts only. Open Logic & Computation for full truth-table and equivalence toolset.',
        scope: 'intro',
        loader: () => import('../pages/subjects/discrete-math/modules/logic/Logic.jsx'),
      },
      // Alias card: exposed in Discrete Math, redirects to canonical it-logic/automata.
      {
        slug: 'automata',
        icon: 'fa-cogs',
        label: 'Automata (FSM)',
        desc: 'Redirects to Logic & Computation workspace (canonical).',
        scope: 'intro',
        isAliasCard: true,
      },
    ],
    aliases: [
      { from: 'automata', toSubject: 'it-logic', toModule: 'automata' },
    ],
  },
  {
    slug: 'linear-algebra',
    label: 'Linear Algebra',
    classification: 'specialized',
    goal: 'Spatial and matrix computation for graphics, optimization, and ML.',
    status: 'active',
    features: { calculator: true, roadmap: false, videos: false },
    modules: [
      {
        slug: 'vectors',
        icon: 'fa-arrows-alt',
        label: 'Vectors',
        desc: 'Vector arithmetic and geometric operations.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/vectors/Vectors.jsx'),
      },
      {
        slug: 'matrices',
        icon: 'fa-border-all',
        label: 'Matrices',
        desc: 'Matrix operations, rank, and inverse.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/matrices/Matrices.jsx'),
      },
      {
        slug: 'linear-systems',
        icon: 'fa-equals',
        label: 'Linear Systems',
        desc: 'Solve systems of linear equations.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/linear-systems/LinearSystems.jsx'),
      },
      {
        slug: 'determinants',
        icon: 'fa-table-cells-large',
        label: 'Determinants',
        desc: 'Determinant properties and computation.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/determinants/Determinants.jsx'),
      },
      {
        slug: 'eigenvalues',
        icon: 'fa-wave-square',
        label: 'Eigenvalues',
        desc: 'Eigenvalues and eigenvectors basics.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/eigenvalues/Eigenvalues.jsx'),
      },
      {
        slug: 'linear-transformations',
        icon: 'fa-shuffle',
        label: 'Linear Transformations',
        desc: 'Mappings, kernels, and image spaces.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/linear-transformations/LinearTransformations.jsx'),
      },
      {
        slug: 'vector-spaces',
        icon: 'fa-vector-square',
        label: 'Vector Spaces',
        desc: 'Subspaces, basis, and dimension.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/vector-spaces/VectorSpaces.jsx'),
      },
      {
        slug: 'orthogonality',
        icon: 'fa-draw-polygon',
        label: 'Orthogonality',
        desc: 'Inner products, projections, orthonormality.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/linear-algebra/modules/orthogonality/Orthogonality.jsx'),
      },
    ],
  },
  {
    slug: 'probability-statistics',
    label: 'Probability & Statistics',
    classification: 'specialized',
    goal: 'Work with uncertainty and data for analytics and machine learning.',
    status: 'active',
    features: { calculator: true, roadmap: false, videos: false },
    modules: [
      {
        slug: 'probability-basics',
        icon: 'fa-dice',
        label: 'Probability Basics',
        desc: 'Fundamental probability calculations and rules.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/probability-statistics/modules/probability-basics/ProbabilityBasics.jsx'),
      },
      {
        slug: 'conditional-probability',
        icon: 'fa-diagram-project',
        label: 'Conditional Probability',
        desc: 'Compute conditional and joint probabilities.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/probability-statistics/modules/conditional-probability/ConditionalProbability.jsx'),
      },
      {
        slug: 'bayes-theorem',
        icon: 'fa-scale-balanced',
        label: "Bayes' Theorem",
        desc: 'Posterior inference with priors and evidence.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/probability-statistics/modules/bayes-theorem/BayesTheorem.jsx'),
      },
      {
        slug: 'distributions',
        icon: 'fa-chart-area',
        label: 'Distributions',
        desc: 'Discrete distributions: Binomial, Poisson, and Geometric.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/probability-statistics/modules/distributions/Distributions.jsx'),
      },
    ],
  },
  {
    slug: 'algorithms',
    label: 'Algorithms & Data Structures',
    classification: 'specialized',
    goal: 'Design fast code with complexity-aware and step-by-step problem solving.',
    status: 'active',
    features: { calculator: true, roadmap: false, videos: false },
    modules: [
      {
        slug: 'asymptotic-analysis',
        icon: 'fa-chart-line',
        label: 'Asymptotic Analysis',
        desc: 'Big O notation and complexity analysis.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/asymptotic-analysis/AsymptoticAnalysis.jsx'),
      },
      {
        slug: 'sorting',
        icon: 'fa-arrow-down-a-z',
        label: 'Sorting Algorithms',
        desc: 'Bubble, merge, and quick sort algorithms.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/sorting/Sorting.jsx'),
      },
      {
        slug: 'searching',
        icon: 'fa-magnifying-glass',
        label: 'Searching Algorithms',
        desc: 'Linear and binary search with step-by-step execution.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/searching/Searching.jsx'),
      },
      {
        slug: 'graph-algorithms',
        icon: 'fa-share-nodes',
        label: 'Graph Algorithms',
        desc: 'Algorithmic traversal and search (DFS/BFS), focused on step-by-step execution.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/graph-algorithms/GraphAlgorithms.jsx'),
      },
      {
        slug: 'dynamic-programming',
        icon: 'fa-puzzle-piece',
        label: 'Dynamic Programming',
        desc: 'Fibonacci, coin change, and optimization.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/dynamic-programming/DynamicProgramming.jsx'),
      },
      {
        slug: 'greedy',
        icon: 'fa-bullseye',
        label: 'Greedy Algorithms',
        desc: 'Optimal substructure and greedy choice.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/greedy/Greedy.jsx'),
      },
      {
        slug: 'divide-conquer',
        icon: 'fa-code-branch',
        label: 'Divide and Conquer',
        desc: 'Subdividing problems and combining solutions.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/divide-conquer/DivideConquer.jsx'),
      },
      {
        slug: 'string-algorithms',
        icon: 'fa-spell-check',
        label: 'String Algorithms',
        desc: 'Pattern matching and string processing.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/algorithms/modules/string-algorithms/StringAlgorithms.jsx'),
      },
    ],
  },
  {
    slug: 'it-logic',
    label: 'Logic & Computation',
    classification: 'specialized',
    goal: 'Deep formal logic for systems, compilers, and finite-state computation.',
    status: 'active',
    features: { calculator: true, roadmap: false, videos: false },
    modules: [
      {
        slug: 'automata',
        icon: 'fa-cogs',
        label: 'Automata (FSM)',
        desc: 'DFA and NFA simulation with state transitions.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/it-logic/modules/automata/Automata.jsx'),
      },
      {
        slug: 'propositional-logic',
        icon: 'fa-brain',
        label: 'Advanced Propositional Logic',
        desc: 'Formal operators, formula analysis, and logical classification.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/it-logic/modules/propositional-logic/PropositionalLogic.jsx'),
      },
      {
        slug: 'truth-tables',
        icon: 'fa-table',
        label: 'Truth Tables',
        desc: 'Generate full truth tables for formulas.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/it-logic/modules/truth-tables/TruthTables.jsx'),
      },
      {
        slug: 'equivalence-laws',
        icon: 'fa-equals',
        label: 'Equivalence Laws',
        desc: 'Check equivalence across logical formulas.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/it-logic/modules/equivalence-laws/EquivalenceLaws.jsx'),
      },
      {
        slug: 'boolean-algebra',
        icon: 'fa-code-branch',
        label: 'Boolean Algebra',
        desc: 'Boolean simplification and operator identities.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/it-logic/modules/boolean-algebra/BooleanAlgebra.jsx'),
      },
    ],
  },
  {
    slug: 'calculus',
    label: 'Calculus',
    classification: 'specialized',
    goal: 'Limits, derivatives, integrals, and series for engineering, ML, and science.',
    status: 'planned',
    features: { calculator: false, roadmap: false, videos: false },
    modules: [
      {
        slug: 'limits-continuity',
        icon: 'fa-wave-square',
        label: 'Limits & Continuity',
        desc: 'Limit laws, continuity, and standard limit patterns.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/limits-continuity/LimitsContinuity.jsx'),
      },
      {
        slug: 'derivatives',
        icon: 'fa-chart-line',
        label: 'Derivatives',
        desc: 'Derivative rules, interpretations, and basic applications.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/derivatives/Derivatives.jsx'),
      },
      {
        slug: 'integrals',
        icon: 'fa-chart-area',
        label: 'Integrals',
        desc: 'Antiderivatives, definite integrals, and the Fundamental Theorem.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/integrals/Integrals.jsx'),
      },
      {
        slug: 'series',
        icon: 'fa-infinity',
        label: 'Series',
        desc: 'Convergence, power series, and Taylor expansions.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/series/Series.jsx'),
      },
      {
        slug: 'multivariable',
        icon: 'fa-cubes',
        label: 'Multivariable Calculus',
        desc: 'Partial derivatives, gradients, and multiple integrals.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/multivariable/Multivariable.jsx'),
      },
      {
        slug: 'differential-equations',
        icon: 'fa-equals',
        label: 'Differential Equations',
        desc: 'First-order ODEs and modeling basics.',
        scope: 'deep-dive',
        loader: () => import('../pages/subjects/calculus/modules/differential-equations/DifferentialEquations.jsx'),
      },
    ],
  },
];

export function getCatalogSubjects() {
  return SUBJECT_CATALOG;
}

export function getCatalogSubject(subjectSlug) {
  return SUBJECT_CATALOG.find((s) => s.slug === subjectSlug) || null;
}

export function getCatalogModules(subjectSlug) {
  return getCatalogSubject(subjectSlug)?.modules || [];
}

export function resolveCatalogAlias(subjectSlug, moduleSlug) {
  const subject = getCatalogSubject(subjectSlug);
  if (!subject?.aliases?.length) return null;
  return subject.aliases.find((a) => a.from === moduleSlug) || null;
}

export function validateCatalog() {
  const errors = [];
  const subjectSlugs = new Set();

  for (const subject of SUBJECT_CATALOG) {
    if (!subject?.slug) {
      errors.push('Subject missing slug');
      continue;
    }
    if (subjectSlugs.has(subject.slug)) {
      errors.push(`Duplicate subject slug: ${subject.slug}`);
    }
    subjectSlugs.add(subject.slug);

    const moduleSlugs = new Set();
    for (const mod of subject.modules || []) {
      if (!mod?.slug) {
        errors.push(`Subject ${subject.slug}: module missing slug`);
        continue;
      }
      if (moduleSlugs.has(mod.slug)) {
        errors.push(`Subject ${subject.slug}: duplicate module slug ${mod.slug}`);
      }
      moduleSlugs.add(mod.slug);

      // Alias cards are allowed to omit loader; others must have loader.
      if (!mod.loader && !mod.isAliasCard) {
        errors.push(`Subject ${subject.slug}: module ${mod.slug} missing loader`);
      }
    }

    for (const alias of subject.aliases || []) {
      if (!alias?.from || !alias?.toSubject || !alias?.toModule) {
        errors.push(`Subject ${subject.slug}: invalid alias entry`);
        continue;
      }
      if (!moduleSlugs.has(alias.from)) {
        errors.push(`Subject ${subject.slug}: alias.from not present as module card: ${alias.from}`);
      }
      const targetSubject = SUBJECT_CATALOG.find((s) => s.slug === alias.toSubject);
      if (!targetSubject) {
        errors.push(`Subject ${subject.slug}: alias target subject not found: ${alias.toSubject}`);
        continue;
      }
      const targetModule = (targetSubject.modules || []).find((m) => m.slug === alias.toModule);
      if (!targetModule?.loader) {
        errors.push(`Subject ${subject.slug}: alias target module not loadable: ${alias.toSubject}/${alias.toModule}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function isCatalogSubjectImplemented(subjectSlug) {
  return Boolean(getCatalogSubject(subjectSlug));
}

/**
 * Load subject module, supporting:
 * - config object default export -> ModuleExperience wrapper
 * - component default export -> returned as-is
 * - alias redirects -> Navigate wrapper
 */
export async function loadCatalogSubjectModule(subjectSlug, moduleSlug) {
  const alias = resolveCatalogAlias(subjectSlug, moduleSlug);
  if (alias) {
    return function AliasRedirect() {
      return React.createElement(Navigate, { to: `/${alias.toSubject}/${alias.toModule}`, replace: true });
    };
  }

  const modEntry = getCatalogModules(subjectSlug).find((m) => m.slug === moduleSlug);
  // Alias-only cards appear in catalogs but redirect via aliases (handled above).
  if (!modEntry?.loader) return undefined;

  const imported = await modEntry.loader();
  const exported = imported?.default ?? imported;

  if (typeof exported === 'function') return exported;
  if (exported && typeof exported === 'object') {
    return function CatalogModuleExperienceWrapper() {
      return React.createElement(ModuleExperience, { config: exported });
    };
  }

  return undefined;
}

