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
      { value: 'logic', label: 'Logic' },
      { value: 'number_theory', label: 'Number Theory' },
    ],
  },
  {
    subjectSlug: 'linear-algebra',
    groupLabel: 'Linear Algebra',
    topics: [
      { value: 'vectors', label: 'Vectors' },
      { value: 'matrices', label: 'Matrices' },
      { value: 'linear_systems', label: 'Linear Systems' },
    ],
  },
  {
    subjectSlug: 'algorithms',
    groupLabel: 'Algorithms & Data Structures',
    topics: [
      { value: 'asymptotic_analysis', label: 'Asymptotic Analysis (Big-O)' },
      { value: 'sorting', label: 'Sorting' },
      { value: 'searching', label: 'Search' },
      { value: 'recursion', label: 'Recursion' },
    ],
  },
  {
    subjectSlug: 'code-to-math',
    groupLabel: 'Code to Math (Math Bug Hunter)',
    topics: [
      { value: 'code_complexity', label: 'Complexity from code' },
      { value: 'code_recurrence', label: 'Recurrence from code' },
    ],
  },
  {
    subjectSlug: 'probability-statistics',
    groupLabel: 'Probability & Statistics',
    topics: [
      { value: 'probability_basics', label: 'Probability Basics' },
      { value: 'bayes_theorem', label: "Bayes' Theorem" },
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
