import { runLinearAlgebra } from './client.js';

export async function calcEigenvalues(payload) {
  return runLinearAlgebra('eigenvalues', payload);
}
