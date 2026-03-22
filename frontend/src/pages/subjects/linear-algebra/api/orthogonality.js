import { runLinearAlgebra } from './client.js';

export async function calcOrthogonality(payload) {
  return runLinearAlgebra('orthogonality', payload);
}
