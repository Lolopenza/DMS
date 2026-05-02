export async function loadModuleContent(subjectSlug, moduleSlug) {
  if (!subjectSlug || !moduleSlug) return null;

  const key = `${subjectSlug}/${moduleSlug}`;

  const loaders = {
    'discrete-math/combinatorics': () => import('./discrete-math/combinatorics.content.js'),
    'discrete-math/logic': () => import('./discrete-math/logic.content.js'),
    'discrete-math/set-theory': () => import('./discrete-math/set-theory.content.js'),
    'discrete-math/graph-theory': () => import('./discrete-math/graph-theory.content.js'),
    'discrete-math/number-theory': () => import('./discrete-math/number-theory.content.js'),
    'discrete-math/probability': () => import('./discrete-math/probability.content.js'),
    'discrete-math/adjacency-matrix': () => import('./discrete-math/adjacency-matrix.content.js'),
    'linear-algebra/matrices': () => import('./linear-algebra/matrices.content.js'),
    'linear-algebra/vectors': () => import('./linear-algebra/vectors.content.js'),
    'linear-algebra/linear-systems': () => import('./linear-algebra/linear-systems.content.js'),
    'linear-algebra/determinants': () => import('./linear-algebra/determinants.content.js'),
    'linear-algebra/eigenvalues': () => import('./linear-algebra/eigenvalues.content.js'),
    'linear-algebra/linear-transformations': () => import('./linear-algebra/linear-transformations.content.js'),
    'linear-algebra/vector-spaces': () => import('./linear-algebra/vector-spaces.content.js'),
    'linear-algebra/orthogonality': () => import('./linear-algebra/orthogonality.content.js'),
    'it-logic/truth-tables': () => import('./it-logic/truth-tables.content.js'),
    'it-logic/propositional-logic': () => import('./it-logic/propositional-logic.content.js'),
    'it-logic/equivalence-laws': () => import('./it-logic/equivalence-laws.content.js'),
    'it-logic/boolean-algebra': () => import('./it-logic/boolean-algebra.content.js'),
    'probability-statistics/probability-basics': () => import('./probability-statistics/probability-basics.content.js'),
    'probability-statistics/conditional-probability': () => import('./probability-statistics/conditional-probability.content.js'),
    'probability-statistics/bayes-theorem': () => import('./probability-statistics/bayes-theorem.content.js'),
    'probability-statistics/distributions': () => import('./probability-statistics/distributions.content.js'),
    'algorithms/asymptotic-analysis': () => import('./algorithms/asymptotic-analysis.content.js'),
    'algorithms/sorting': () => import('./algorithms/sorting.content.js'),
    'algorithms/searching': () => import('./algorithms/searching.content.js'),
    'algorithms/graph-algorithms': () => import('./algorithms/graph-algorithms.content.js'),
    'algorithms/dynamic-programming': () => import('./algorithms/dynamic-programming.content.js'),
    'algorithms/greedy': () => import('./algorithms/greedy.content.js'),
    'algorithms/divide-conquer': () => import('./algorithms/divide-conquer.content.js'),
    'algorithms/string-algorithms': () => import('./algorithms/string-algorithms.content.js'),
  };

  const loader = loaders[key];
  if (!loader) return null;

  const mod = await loader();
  return mod?.default ?? mod ?? null;
}

