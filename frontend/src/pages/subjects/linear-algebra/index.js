export const linearAlgebraModules = {
  vectors: () => import('./modules/vectors/Vectors.jsx'),
  matrices: () => import('./modules/matrices/Matrices.jsx'),
  'linear-systems': () => import('./modules/linear-systems/LinearSystems.jsx'),
  determinants: () => import('./modules/determinants/Determinants.jsx'),
  eigenvalues: () => import('./modules/eigenvalues/Eigenvalues.jsx'),
  'linear-transformations': () => import('./modules/linear-transformations/LinearTransformations.jsx'),
  'vector-spaces': () => import('./modules/vector-spaces/VectorSpaces.jsx'),
  orthogonality: () => import('./modules/orthogonality/Orthogonality.jsx'),
};

export async function loadModule(moduleSlug) {
  const loader = linearAlgebraModules[moduleSlug];
  if (!loader) return undefined;
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load linear algebra module ${moduleSlug}:`, error);
    return undefined;
  }
}

export function getModuleList() {
  return Object.keys(linearAlgebraModules);
}
