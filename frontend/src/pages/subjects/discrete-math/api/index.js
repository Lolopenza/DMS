/**
 * API Facade for discrete-math subject
 * 
 * This file aggregates all module-specific API functions for convenience.
 * Individual modules can import directly from their module files if needed:
 *   import { calcCombinatorics } from '@/subjects/discrete-math/api/combinatorics.js';
 * 
 * Or import from facade (for backward compatibility):
 *   import { calcCombinatorics } from '@/subjects/discrete-math/api/index.js';
 */

export { calcCombinatorics } from './combinatorics.js';
export { calcLogic } from './logic.js';
export { calcSetTheory } from './set-theory.js';
export { calcGraphTheory } from './graph-theory.js';
export { calcAutomata } from './automata.js';
export { calcNumberTheory } from './number-theory.js';
export { calcProbability } from './probability.js';
export { calcAdjacencyMatrix } from './adjacency-matrix.js';
