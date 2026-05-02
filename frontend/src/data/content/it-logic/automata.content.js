/** Theory for Finite Automata — aligned with combinatorics-style modules (overview + outcomes + formulas + examples). */
const automataTheory = {
  overview:
    'Finite automata are the simplest computational model for **regular languages**: finite state sets, an alphabet, transitions, start and accept states, and acceptance defined by reaching an accept state after consuming the input left-to-right.',
  outcomes: [
    'Describe a DFA/NFA as states, alphabet, transitions, start, and accepts.',
    'Simulate an automaton on an input string and read an acceptance trace.',
    'Contrast deterministic vs nondeterministic transitions.',
    'Relate automata to lexical analysis and protocol state machines.',
  ],
  formulas: [
    { title: 'DFA transition', content: '$$\\delta: Q \\times \\Sigma \\to Q$$' },
    { title: 'NFA transition', content: '$$\\delta: Q \\times \\Sigma \\to \\mathcal{P}(Q)$$' },
    { title: 'Acceptance', content: '$$w \\in L(M)\\iff \\delta^*(q_0,w)\\cap F \\neq \\varnothing\\ \\text{(NFA)}$$' },
  ],
  examples: [
    {
      title: 'Worked example: substring detector',
      content:
        'Build states \\(q_0\\to q_1\\to q_2\\) on symbols `0,1` so that \\(q_2\\) means you have just seen `01`. Accept states include \\(q_2\\) if the language is “ends with 01”.',
    },
    {
      title: 'Worked example: trace intuition',
      content:
        'For input `010` starting at \\(q_0\\), follow **one** outgoing transition per symbol (DFA). If you land in an accept state after the last symbol, the string is accepted.',
    },
  ],
};

export default automataTheory;
