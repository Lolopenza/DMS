export const itLogicModules = {
  automata: () => import('../discrete-math/modules/automata/Automata.jsx'),
  'propositional-logic': () => import('./modules/propositional-logic/PropositionalLogic.jsx'),
  'truth-tables': () => import('./modules/truth-tables/TruthTables.jsx'),
  'equivalence-laws': () => import('./modules/equivalence-laws/EquivalenceLaws.jsx'),
  'boolean-algebra': () => import('./modules/boolean-algebra/BooleanAlgebra.jsx'),
};

export async function loadModule(moduleSlug) {
  const loader = itLogicModules[moduleSlug];
  if (!loader) return undefined;
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load it-logic module ${moduleSlug}:`, error);
    return undefined;
  }
}

export function getModuleList() {
  return Object.keys(itLogicModules);
}
