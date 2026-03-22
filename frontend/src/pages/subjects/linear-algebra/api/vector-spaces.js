import { runLinearAlgebra } from './client.js';

export async function calcVectorSpaces(payload) {
  return runLinearAlgebra('vector-spaces', payload);
}
