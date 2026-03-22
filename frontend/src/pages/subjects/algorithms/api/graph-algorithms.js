import { runAlgorithms } from './client.js';

export async function calcGraphAlgorithms(payload) {
  return runAlgorithms('graph-algorithms', payload);
}
