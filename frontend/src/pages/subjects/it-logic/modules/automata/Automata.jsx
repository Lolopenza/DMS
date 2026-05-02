import { calcAutomata } from '../../../discrete-math/api/automata.js';
import ModuleExperience from '../../../../../components/module/ModuleExperience.jsx';
import automataTheory from '../../../../../data/content/it-logic/automata.content.js';

const AUTOMATA_TYPES = [
  { value: 'DFA', label: 'DFA (Deterministic Finite Automaton)', hint: 'Each state has exactly one transition per symbol' },
  { value: 'NFA', label: 'NFA (Nondeterministic Finite Automaton)', hint: 'States can have multiple transitions per symbol' },
];

function parseCsvList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTransitionsLines(raw) {
  return String(raw || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => part.trim()))
    .filter((parts) => parts.length >= 3);
}

function transitionsToObject({ automatonType, transitions }) {
  const transitionObj = {};
  transitions.forEach((parts) => {
    const [from, symbol, to] = parts;
    if (!from || !symbol || !to) return;
    if (!transitionObj[from]) transitionObj[from] = {};
    if (automatonType === 'NFA') {
      if (!transitionObj[from][symbol]) transitionObj[from][symbol] = [];
      transitionObj[from][symbol].push(to);
      return;
    }
    transitionObj[from][symbol] = to;
  });
  return transitionObj;
}

const automataConfig = {
  id: 'automata',
  eyebrow: 'Logic & Computation',
  title: 'Finite Automata',
  subtitle: 'Simulate DFA/NFA and inspect acceptance traces.',
  theory: automataTheory,
  practice: {
    title: 'Automaton Simulator',
    description: 'Enter automaton definition and test input strings.',
    operationLabel: 'Mode',
    submitLabel: 'Simulate',
    loadingLabel: 'Simulating...',
    calculate: calcAutomata,
    buildPayload: ({ values }) => {
      const automatonType = String(values.automatonType || 'DFA');
      const transitions = parseTransitionsLines(values.transitions);
      return {
        automaton_type: automatonType,
        states: parseCsvList(values.states),
        alphabet: parseCsvList(values.alphabet),
        start_state: String(values.startState || '').trim(),
        accept_states: parseCsvList(values.acceptStates),
        transitions: transitionsToObject({ automatonType, transitions }),
        input_string: String(values.inputString || ''),
      };
    },
    mapResult: (data) => data.result ?? data,
    operations: [{ value: 'simulate', label: 'Simulate', default: true }],
    fields: [
      {
        name: 'automatonType',
        label: 'Automaton type',
        type: 'select',
        defaultValue: 'DFA',
        options: AUTOMATA_TYPES,
        required: true,
      },
      {
        name: 'states',
        label: 'States',
        smartType: 'set-list',
        type: 'text',
        defaultValue: 'q0,q1,q2',
        hint: 'Comma-separated state names.',
        required: true,
        span: 'full',
      },
      {
        name: 'alphabet',
        label: 'Alphabet',
        smartType: 'set-list',
        type: 'text',
        defaultValue: '0,1',
        hint: 'Comma-separated symbols.',
        required: true,
        span: 'full',
      },
      {
        name: 'startState',
        label: 'Start state',
        type: 'text',
        defaultValue: 'q0',
        required: true,
      },
      {
        name: 'acceptStates',
        label: 'Accept states',
        smartType: 'set-list',
        type: 'text',
        defaultValue: 'q2',
        hint: 'Comma-separated final states.',
        required: true,
      },
      {
        name: 'transitions',
        label: 'Transitions',
        type: 'textarea',
        rows: 6,
        defaultValue: 'q0,0,q1\nq1,1,q2',
        hint: 'Format: from_state,symbol,to_state (one per line).',
        required: true,
        span: 'full',
      },
      {
        name: 'inputString',
        label: 'Input string',
        type: 'text',
        defaultValue: '01',
        required: true,
        span: 'full',
      },
    ],
  },
};

export default function Automata() {
  return <ModuleExperience config={automataConfig} />;
}
