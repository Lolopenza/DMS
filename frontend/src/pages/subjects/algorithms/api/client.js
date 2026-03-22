import { calcAlgorithms } from '../../../../api.js';

export function runAlgorithms(module, payload) {
  return calcAlgorithms({ module, ...payload });
}
