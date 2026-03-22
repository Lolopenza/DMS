import { runLinearAlgebra } from './client.js';

export async function calcDeterminants(payload) {
  return runLinearAlgebra('determinants', payload);
}
