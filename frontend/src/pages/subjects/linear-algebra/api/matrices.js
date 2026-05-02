import { runLinearAlgebra } from './client.js';

/** Matrix operations via POST /api/calculator/linear_algebra (module=matrices). */
export function calcMatrices(payload) {
  return runLinearAlgebra('matrices', payload);
}
