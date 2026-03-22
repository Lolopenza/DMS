import { runLinearAlgebra } from './client.js';

export async function calcVectors(payload) {
  return runLinearAlgebra('vectors', payload);
}
