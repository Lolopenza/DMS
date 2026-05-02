/**
 * Maps calculator route `/{subjectSlug}/{moduleSlug}` → interactive practice `skillTopicSlug` (BKT).
 * Fallback when the catalog API is unreachable; must stay aligned with
 * {@code com.dmc.learning.config.ModuleDependencyGraph} on the backend.
 */
const SKILL_TOPIC_BY_ROUTE = {
  'discrete-math/set-theory': 'set_theory',
  'discrete-math/combinatorics': 'combinatorics',
  'discrete-math/logic': 'logic',
  'discrete-math/graph-theory': 'graph_theory',
  'discrete-math/number-theory': 'number_theory',
  'linear-algebra/vectors': 'vectors',
  'linear-algebra/matrices': 'matrices',
  'linear-algebra/linear-systems': 'linear_systems',
  'linear-algebra/determinants': 'determinants',
  'linear-algebra/eigenvalues': 'eigenvalues',
  'probability-statistics/probability-basics': 'probability_basics',
  'algorithms/sorting': 'sorting',
  'algorithms/asymptotic-analysis': 'asymptotic_analysis',
  'it-logic/truth-tables': 'truth_tables',
  'it-logic/automata': 'automata',
};

/**
 * @param {string | undefined} subjectSlug
 * @param {string | undefined} moduleSlug
 * @returns {string | null}
 */
export function getPracticeSkillTopicFallback(subjectSlug, moduleSlug) {
  if (!subjectSlug || !moduleSlug) return null;
  const key = `${subjectSlug}/${moduleSlug}`;
  return SKILL_TOPIC_BY_ROUTE[key] ?? null;
}
