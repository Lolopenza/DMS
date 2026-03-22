export const algorithmModules = {
  'asymptotic-analysis': () => import('./modules/asymptotic-analysis/AsymptoticAnalysis.jsx'),
  'sorting': () => import('./modules/sorting/Sorting.jsx'),
  'searching': () => import('./modules/searching/Searching.jsx'),
  'graph-algorithms': () => import('./modules/graph-algorithms/GraphAlgorithms.jsx'),
  'dynamic-programming': () => import('./modules/dynamic-programming/DynamicProgramming.jsx'),
  'greedy': () => import('./modules/greedy/Greedy.jsx'),
  'divide-conquer': () => import('./modules/divide-conquer/DivideConquer.jsx'),
  'string-algorithms': () => import('./modules/string-algorithms/StringAlgorithms.jsx'),
};

export async function loadModule(moduleSlug) {
  const loader = algorithmModules[moduleSlug];
  if (!loader) return undefined;
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load algorithms module ${moduleSlug}:`, error);
    return undefined;
  }
}

export function getModuleList() {
  return Object.keys(algorithmModules);
}
