import { runLinearAlgebra } from './client.js';

export async function calcLinearSystems(payload) {
  return runLinearAlgebra('linear-systems', payload);
}
