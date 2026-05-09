/**
 * Interactive AI practice topics — topicSlug in POST /api/problems/generated.
 * Must stay aligned with backend {@code PracticeTopics.ALL_SLUGS}.
 */

export const ADAPTIVE_TOPIC_VALUE = '__adaptive__';

/** Grouped for Personal Practice Lab UI (optgroup). */
export const PRACTICE_TOPIC_GROUPS = [
  {
    subjectSlug: 'discrete-math',
    groupLabel: 'Discrete Mathematics',
    topics: [
      { value: 'combinatorics', label: 'Combinatorics' },
      { value: 'graph_theory', label: 'Graph Theory' },
      { value: 'set_theory', label: 'Set Theory' },
      { value: 'logic', label: 'Logic (Intro)' },
      { value: 'number_theory', label: 'Number Theory' },
      { value: 'probability', label: 'Probability (Intro)' },
      { value: 'adjacency_matrix', label: 'Adjacency Matrix' },
    ],
  },
  {
    subjectSlug: 'linear-algebra',
    groupLabel: 'Linear Algebra',
    topics: [
      { value: 'vectors', label: 'Vectors' },
      { value: 'matrices', label: 'Matrices' },
      { value: 'linear_systems', label: 'Linear Systems' },
      { value: 'determinants', label: 'Determinants' },
      { value: 'eigenvalues', label: 'Eigenvalues & Eigenvectors' },
      { value: 'linear_transformations', label: 'Linear Transformations' },
      { value: 'vector_spaces', label: 'Vector Spaces' },
      { value: 'orthogonality', label: 'Orthogonality' },
    ],
  },
  {
    subjectSlug: 'probability-statistics',
    groupLabel: 'Probability & Statistics',
    topics: [
      { value: 'probability_basics', label: 'Probability Basics' },
      { value: 'conditional_probability', label: 'Conditional Probability' },
      { value: 'bayes_theorem', label: "Bayes' Theorem" },
      { value: 'distributions', label: 'Distributions' },
    ],
  },
  {
    subjectSlug: 'algorithms',
    groupLabel: 'Algorithms & Data Structures',
    topics: [
      { value: 'asymptotic_analysis', label: 'Asymptotic Analysis (Big-O)' },
      { value: 'sorting', label: 'Sorting Algorithms' },
      { value: 'searching', label: 'Searching Algorithms' },
      { value: 'recursion', label: 'Recursion' },
      { value: 'graph_algorithms', label: 'Graph Algorithms (BFS/DFS)' },
      { value: 'dynamic_programming', label: 'Dynamic Programming' },
      { value: 'greedy', label: 'Greedy Algorithms' },
      { value: 'divide_conquer', label: 'Divide and Conquer' },
      { value: 'string_algorithms', label: 'String Algorithms' },
    ],
  },
  {
    subjectSlug: 'it-logic',
    groupLabel: 'Logic & Computation',
    topics: [
      { value: 'automata', label: 'Automata (DFA/NFA)' },
      { value: 'propositional_logic', label: 'Propositional Logic' },
      { value: 'truth_tables', label: 'Truth Tables' },
      { value: 'equivalence_laws', label: 'Equivalence Laws' },
      { value: 'boolean_algebra', label: 'Boolean Algebra' },
    ],
  },
  {
    subjectSlug: 'calculus',
    groupLabel: 'Calculus',
    topics: [
      { value: 'limits_continuity', label: 'Limits & Continuity' },
      { value: 'derivatives', label: 'Derivatives' },
      { value: 'integrals', label: 'Integrals' },
      { value: 'series', label: 'Series & Sequences' },
      { value: 'multivariable', label: 'Multivariable Calculus' },
      { value: 'differential_equations', label: 'Differential Equations' },
    ],
  },
  {
    subjectSlug: 'code-to-math',
    groupLabel: 'Code to Math (Math Bug Hunter)',
    topics: [
      { value: 'code_complexity', label: 'Complexity from Code' },
      { value: 'code_recurrence', label: 'Recurrence from Code' },
    ],
  },
];

const LABEL_BY_SLUG = new Map();
PRACTICE_TOPIC_GROUPS.forEach((g) => {
  g.topics.forEach((t) => {
    LABEL_BY_SLUG.set(t.value, t.label);
  });
});

export function getPracticeTopicLabel(slug) {
  if (!slug) return '';
  return LABEL_BY_SLUG.get(slug) || slug.replace(/_/g, ' ');
}

export function getAllPracticeTopicSlugs() {
  return [...LABEL_BY_SLUG.keys()];
}
