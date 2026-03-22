import { runLinearAlgebra } from './client.js';

export async function calcLinearTransformations(payload) {
  return runLinearAlgebra('linear-transformations', payload);
}
