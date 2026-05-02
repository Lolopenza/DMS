import { calcNumberTheory } from '../../api/number-theory.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import numberTheoryContent from '../../../../../data/content/discrete-math/number-theory.content.js';

const OPERATIONS = [
  { value: 'gcd', label: 'GCD(a, b)', hint: 'Greatest common divisor.' },
  { value: 'lcm', label: 'LCM(a, b)', hint: 'Least common multiple.' },
  { value: 'divisors', label: 'Divisors(n)', hint: 'List all positive divisors of n.' },
  { value: 'factorize', label: 'Prime factorization', hint: 'Factor n into primes.' },
  { value: 'totient', label: "Euler's φ(n)", hint: 'Count integers ≤ n coprime to n.' },
  { value: 'mod_exp', label: 'Mod exp (base^exp mod m)', hint: 'Fast exponentiation modulo m.' },
  { value: 'mod_inv', label: 'Mod inverse (a^{-1} mod m)', hint: 'Compute modular inverse if it exists.' },
];

const numberTheoryConfig = {
  id: 'number-theory',
  eyebrow: 'Discrete Mathematics',
  title: 'Number Theory',
  subtitle: 'GCD, primes, factorization, totient, and modular arithmetic.',
  theory: numberTheoryContent,
  practice: {
    title: 'Number theory calculator',
    description: 'Choose an operation and fill the needed inputs.',
    operationLabel: 'Operation',
    submitLabel: 'Calculate',
    loadingLabel: 'Calculating...',
    calculate: calcNumberTheory,
    buildPayload: ({ operation, values }) => {
      const op = String(operation);
      if (op === 'gcd' || op === 'lcm') {
        return { operation: op, a: Number(values.a), b: Number(values.b) };
      }
      if (op === 'mod_exp') {
        return { operation: op, base: Number(values.base), exponent: Number(values.exponent), modulus: Number(values.modulus) };
      }
      if (op === 'mod_inv') {
        return { operation: op, a: Number(values.a), m: Number(values.modulus) };
      }
      return { operation: op, n: Number(values.n) };
    },
    mapResult: (data) => data.result ?? data,
    operations: OPERATIONS.map((op, idx) => ({ ...op, default: idx === 0 })),
    fields: [
      {
        name: 'a',
        label: 'a',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 24,
        required: true,
        showWhen: ['gcd', 'lcm', 'mod_inv'],
      },
      {
        name: 'b',
        label: 'b',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 36,
        required: true,
        showWhen: ['gcd', 'lcm'],
      },
      {
        name: 'n',
        label: 'n',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 36,
        required: true,
        showWhen: ['divisors', 'factorize', 'totient'],
        span: 'full',
      },
      {
        name: 'base',
        label: 'base',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 17,
        required: true,
        showWhen: ['mod_exp'],
      },
      {
        name: 'exponent',
        label: 'exponent',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 5,
        required: true,
        showWhen: ['mod_exp'],
      },
      {
        name: 'modulus',
        label: 'modulus (m)',
        smartType: 'validated-number',
        type: 'number',
        defaultValue: 12,
        required: true,
        showWhen: ['mod_exp', 'mod_inv'],
      },
    ],
  },
};

export default function NumberTheory() {
  return <ModuleExperience config={numberTheoryConfig} />;
}
