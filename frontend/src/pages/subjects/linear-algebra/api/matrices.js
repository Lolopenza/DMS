import { runLinearAlgebra } from './client.js';

export async function calcMatrices(payload) {
  return runLinearAlgebra('matrices', payload);
}
