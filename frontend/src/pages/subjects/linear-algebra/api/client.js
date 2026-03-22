import { calcLinearAlgebra } from '../../../../api.js';

export function runLinearAlgebra(module, payload) {
  return calcLinearAlgebra({ module, ...payload });
}
