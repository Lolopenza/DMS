/**
 * Module Registry for discrete-math subject
 * 
 * Dynamically imports modules for lazy loading and to avoid manual wiring in App.jsx
 * 
 * Phase 2 Status:
 *   ✅ Batch 1 (migrated): combinatorics, logic, set-theory, graph-theory
 *   ✅ Batch 2 (migrated): number-theory, probability, adjacency-matrix
 *   ⏳ Shared (pending): calculator, roadmap
 */

export const discreteMathModules = {
  // Batch 1: Already migrated to new subject structure
  combinatorics: () => import('./modules/combinatorics/Combinatorics.jsx'),
  logic: () => import('./modules/logic/Logic.jsx'),
  'set-theory': () => import('./modules/set-theory/SetTheory.jsx'),
  'graph-theory': () => import('./modules/graph-theory/GraphTheory.jsx'),
  
  // Batch 2: Migrated to new subject structure
  'number-theory': () => import('./modules/number-theory/NumberTheory.jsx'),
  probability: () => import('./modules/probability/Probability.jsx'),
  'adjacency-matrix': () => import('./modules/adjacency-matrix/AdjacencyMatrix.jsx'),
  
  // Shared: Still in old structure, will be migrated in next phase
  // calculator: () => import('./modules/calculator/Calculator.jsx'),
  // roadmap: () => import('./modules/roadmap/Roadmap.jsx'),
};

/**
 * Safely load a module by slug
 * Falls back to undefined if module not found (allows parent to handle 404)
 */
export async function loadModule(moduleSlug) {
  const loader = discreteMathModules[moduleSlug];
  if (!loader) {
    console.warn(`Module not found: ${moduleSlug}`);
    return undefined;
  }
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load module ${moduleSlug}:`, error);
    return undefined;
  }
}

/**
 * Get module list for metadata/navigation
 */
export function getModuleList() {
  return Object.keys(discreteMathModules);
}
