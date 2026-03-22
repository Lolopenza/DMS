export const probabilityStatisticsModules = {
  'probability-basics': () => import('./modules/probability-basics/ProbabilityBasics.jsx'),
  'conditional-probability': () => import('./modules/conditional-probability/ConditionalProbability.jsx'),
  'bayes-theorem': () => import('./modules/bayes-theorem/BayesTheorem.jsx'),
  'distributions': () => import('./modules/distributions/Distributions.jsx'),
};

export async function loadModule(moduleSlug) {
  const loader = probabilityStatisticsModules[moduleSlug];
  if (!loader) return undefined;
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load probability-statistics module ${moduleSlug}:`, error);
    return undefined;
  }
}

export function getModuleList() {
  return Object.keys(probabilityStatisticsModules);
}
