// Single source of truth for all calculator sections.
// Used by: Layout (nav + footer), Calculator (index cards), App (route list).

export const SECTIONS = [
  { path: '/combinatorics',    icon: 'fa-cube',            label: 'Combinatorics',    desc: 'Permutations, combinations, counting.' },
  { path: '/probability',      icon: 'fa-dice',            label: 'Probability',      desc: 'Probabilities, distributions, simulations.' },
  { path: '/graph-theory',     icon: 'fa-project-diagram', label: 'Graph Theory',     desc: 'Visualize graphs, run algorithms, explore properties.' },
  { path: '/adjacency-matrix', icon: 'fa-th',              label: 'Adjacency Matrix', desc: 'Matrix editor, graph from matrix.' },
  { path: '/automata',         icon: 'fa-cogs',            label: 'Automata',         desc: 'DFA, NFA — simulate and analyze.' },
  { path: '/set-theory',       icon: 'fa-object-group',    label: 'Set Theory',       desc: 'Set operations and relations.' },
  { path: '/number-theory',    icon: 'fa-hashtag',         label: 'Number Theory',    desc: 'GCD, primes, modular arithmetic.' },
  { path: '/logic',            icon: 'fa-brain',           label: 'Logic',            desc: 'Truth tables, logical equivalence.' },
];
