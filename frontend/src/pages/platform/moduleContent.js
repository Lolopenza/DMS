function searchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function embedSearchUrl(query) {
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`;
}

const DISCRETE_MARKDOWN = {
  combinatorics: String.raw`# Combinatorics: The Art of Counting

Combinatorics studies how to count finite configurations without brute-force enumeration. It is the backbone of complexity estimates and search-space analysis.

## Key Formulas

- Factorial: $n! = n \cdot (n-1) \cdots 1$
- Permutations (order matters): $P(n,r) = \frac{n!}{(n-r)!}$
- Combinations (order does not matter): $C(n,r) = \binom{n}{r} = \frac{n!}{r!(n-r)!}$

## How it Works

1. Identify whether order matters.
2. Decide if repetition is allowed.
3. Apply the matching counting formula and simplify.

## Why it Matters for IT

- Password-space size and brute-force resistance.
- Upper bounds for backtracking and branch-and-bound algorithms.
`,
  'set-theory': String.raw`# Set Theory: Language of Discrete Structures

Set theory defines collections and operations over them. It provides a formal vocabulary for relations, mappings, and logical reasoning.

## Key Concepts

- Union: $A \cup B$
- Intersection: $A \cap B$
- Difference: $A \setminus B$
- Power set size: $|\mathcal{P}(A)| = 2^{|A|}$

## How it Works

1. Model entities as elements of sets.
2. Compose operations to represent constraints.
3. Validate identities with algebraic laws or Venn reasoning.

## Why it Matters for IT

- Query filtering and rule composition.
- Formalizing domains, permissions, and relation closures.
`,
  logic: String.raw`# Logic (Intro): Formal Reasoning Core

Logic turns statements into formal objects that can be evaluated consistently. Intro logic focuses on propositions and truth-functional operators.

## Key Concepts

- Negation: $\neg P$
- Conjunction: $P \land Q$
- Disjunction: $P \lor Q$
- Truth table classification: tautology / contradiction / contingency

## How it Works

1. Define variables and operator structure.
2. Enumerate truth assignments.
3. Evaluate formula output row-by-row.

## Why it Matters for IT

- Condition design in software and rule engines.
- Specification sanity checks in verification workflows.
`,
  probability: String.raw`# Probability (Intro): Modeling Uncertainty

Probability quantifies uncertainty in finite sample spaces. Intro probability builds intuition before advanced inference.

## Key Formulas

- Basic probability: $P(A) = \frac{|A|}{|\Omega|}$
- Complement: $P(\overline{A}) = 1 - P(A)$
- Union (two events): $P(A \cup B) = P(A) + P(B) - P(A \cap B)$

## How it Works

1. Define sample space $\Omega$ and event sets.
2. Count favorable vs total outcomes.
3. Use algebraic rules to combine events.

## Why it Matters for IT

- Risk scoring and alert thresholds.
- Foundation for Bayesian and statistical ML pipelines.
`,
  'graph-theory': String.raw`# Graph Theory: Structures of Connectivity

Graph theory models systems as vertices and edges. It captures relationships in networks, dependencies, and state transitions.

## Key Concepts

- Graph: $G=(V,E)$
- Degree of vertex $v$: $\deg(v)$
- Path length and connectivity
- Directed vs undirected representations

## How it Works

1. Encode entities as vertices and links as edges.
2. Choose representation (edge list, adjacency list, matrix).
3. Compute local/global structure metrics.

## Why it Matters for IT

- Network topology and routing problems.
- Dependency graphs in compilers, CI pipelines, and package managers.
`,
  'adjacency-matrix': String.raw`# Adjacency Matrix: Dense Graph Representation

An adjacency matrix stores graph connectivity in tabular form. It is efficient for dense graphs and algebraic graph operations.

## Key Concepts

- Matrix entry: $A_{ij}=1$ if edge $(i,j)$ exists, else $0$
- Undirected graph property: $A = A^T$
- Path counting: $(A^k)_{ij}$ gives number of length-$k$ walks from $i$ to $j$

## How it Works

1. Index vertices from $0$ to $n-1$.
2. Fill matrix by edge existence/weight.
3. Analyze degree, neighbors, and powers of $A$.

## Why it Matters for IT

- Matrix-based graph analytics and GPU-friendly operations.
- Fast implementation path for dense relation systems.
`,
  'number-theory': String.raw`# Number Theory: Arithmetic for Computation

Number theory studies integer properties and modular systems. It is central to cryptography and low-level algorithm design.

## Key Formulas

- Euclidean identity: $\gcd(a,b)$ via repeated remainder reduction
- Modular congruence: $a \equiv b \pmod n$
- Linear congruence form: $ax \equiv b \pmod n$

## How it Works

1. Reduce integer tasks to divisibility and modular forms.
2. Apply GCD/LCM or factorization depending on goal.
3. Use modular rules to simplify large-number computations.

## Why it Matters for IT

- Cryptosystems (RSA and modular arithmetic primitives).
- Hashing, checksums, and periodic scheduling logic.
`,
};

const CONTENT_MAP = {
  'discrete-math/combinatorics': {
    theory: {
      intro: 'Combinatorics explains how to count finite choices and arrangements without listing every case.',
      keyPoints: [
        'Factorial counts full permutations of n distinct objects.',
        'Permutation nPr counts ordered selections.',
        'Combination nCr counts unordered selections.',
      ],
    },
    videos: [
      {
        title: 'Combinatorics Basics: Factorial, nPr, nCr',
        url: searchUrl('combinatorics factorial permutation combination lecture'),
        embedUrl: embedSearchUrl('combinatorics factorial permutation combination lecture'),
      },
      {
        title: 'Counting Principles for Discrete Math',
        url: searchUrl('discrete mathematics counting principles'),
        embedUrl: embedSearchUrl('discrete mathematics counting principles'),
      },
    ],
  },
  'discrete-math/number-theory': {
    theory: {
      intro: 'Number theory studies integer structure, divisibility, and modular systems used in computing and cryptography.',
      keyPoints: [
        'GCD and LCM summarize shared factors and periodic alignment.',
        'Prime factorization decomposes integers into irreducible parts.',
        'Modular arithmetic models wrap-around behavior and congruence.',
      ],
    },
    videos: [
      {
        title: 'GCD, LCM, and Euclidean Algorithm',
        url: searchUrl('euclidean algorithm gcd lcm discrete math'),
        embedUrl: embedSearchUrl('euclidean algorithm gcd lcm discrete math'),
      },
      {
        title: 'Modular Arithmetic Fundamentals',
        url: searchUrl('modular arithmetic introduction'),
        embedUrl: embedSearchUrl('modular arithmetic introduction'),
      },
    ],
  },
  'discrete-math/graph-theory': {
    theory: {
      intro: 'Graph theory introduces vertices and edges as abstractions for relationships and network structure.',
      keyPoints: [
        'Degree measures local connectivity at each vertex.',
        'Adjacency captures graph structure in matrix/list form.',
        'Graph representations are prerequisites for graph algorithms.',
      ],
    },
    videos: [
      {
        title: 'Graph Theory Intro: Nodes, Edges, Degree',
        url: searchUrl('graph theory introduction nodes edges degree'),
        embedUrl: embedSearchUrl('graph theory introduction nodes edges degree'),
      },
      {
        title: 'Adjacency Matrix Explained',
        url: searchUrl('adjacency matrix graph representation'),
        embedUrl: embedSearchUrl('adjacency matrix graph representation'),
      },
    ],
  },
  'discrete-math/adjacency-matrix': {
    theory: {
      intro: 'An adjacency matrix is a compact way to encode graph connections and inspect structural properties quickly.',
      keyPoints: [
        'Each matrix cell indicates whether an edge exists between two vertices.',
        'Row and column scans reveal out-degree and in-degree patterns.',
        'Matrix powers can expose path counts of fixed length.',
      ],
    },
    videos: [
      {
        title: 'Adjacency Matrix in Graph Theory',
        url: searchUrl('adjacency matrix graph theory tutorial'),
        embedUrl: embedSearchUrl('adjacency matrix graph theory tutorial'),
      },
      {
        title: 'From Matrix to Graph Intuition',
        url: searchUrl('graph from adjacency matrix explanation'),
        embedUrl: embedSearchUrl('graph from adjacency matrix explanation'),
      },
    ],
  },
  'discrete-math/set-theory': {
    theory: {
      intro: 'Set theory provides the language of collections, operations, and relations that underpins discrete mathematics.',
      keyPoints: [
        'Union, intersection, and difference combine and separate collections.',
        'Subset and power set concepts describe containment and combinational growth.',
        'Venn-diagram reasoning helps validate algebraic set identities.',
      ],
    },
    videos: [
      {
        title: 'Set Operations and Venn Diagrams',
        url: searchUrl('set theory union intersection venn diagram lecture'),
        embedUrl: embedSearchUrl('set theory union intersection venn diagram lecture'),
      },
      {
        title: 'Power Sets and Cartesian Product',
        url: searchUrl('power set cartesian product discrete math'),
        embedUrl: embedSearchUrl('power set cartesian product discrete math'),
      },
    ],
  },
  'discrete-math/logic': {
    theory: {
      intro: 'Discrete logic formalizes statements and connectives so that reasoning becomes explicit and testable.',
      keyPoints: [
        'Truth values model proposition outcomes as true or false.',
        'AND, OR, and NOT form the core connective toolkit.',
        'Truth tables verify whether a formula is always true, always false, or contingent.',
      ],
    },
    videos: [
      {
        title: 'Propositional Logic Fundamentals',
        url: searchUrl('propositional logic basics truth tables'),
        embedUrl: embedSearchUrl('propositional logic basics truth tables'),
      },
      {
        title: 'Logic Connectives with Examples',
        url: searchUrl('and or not truth table examples'),
        embedUrl: embedSearchUrl('and or not truth table examples'),
      },
    ],
  },
  'discrete-math/probability': {
    theory: {
      intro: 'Intro probability measures how likely events are in finite sample spaces before advanced statistical modeling.',
      keyPoints: [
        'Probability of an event is favorable outcomes over total equally likely outcomes.',
        'Complement rule helps compute probabilities by subtraction from 1.',
        'Simple event modeling builds intuition for conditional and Bayesian methods later.',
      ],
    },
    videos: [
      {
        title: 'Probability Basics for Discrete Math',
        url: searchUrl('probability basics sample space events'),
        embedUrl: embedSearchUrl('probability basics sample space events'),
      },
      {
        title: 'Complement Rule and Basic Counting',
        url: searchUrl('complement rule probability examples'),
        embedUrl: embedSearchUrl('complement rule probability examples'),
      },
    ],
  },
};

function fallbackTheory(moduleMeta) {
  return {
    intro: `${moduleMeta.desc} Этот модуль находится в разработке. Ознакомьтесь с теорией в основном треке Discrete Math.`,
    markdown: String.raw`# ${moduleMeta.label}

Этот модуль находится в разработке. Ознакомьтесь с теорией в основном треке Discrete Math.

## Current Status

- Доступен компактный обзор концепций.
- Полный модульный теоретический блок будет добавлен в следующей итерации.
`,
    keyPoints: [
      'Сейчас доступен краткий обзор концепций для быстрой ориентации.',
      'Полный теоретический блок будет опубликован в следующей итерации контента.',
      'Для полноценного сценария демонстрации используйте флагманский трек Discrete Math.',
    ],
  };
}

function fallbackVideos(subject, moduleMeta) {
  const base = `${moduleMeta.label} ${subject} lecture`; 
  return [
    {
      title: `${moduleMeta.label}: Overview (In Development)` ,
      url: searchUrl(base),
      embedUrl: embedSearchUrl(base),
    },
  ];
}

export function getModuleLearningContent(subject, moduleMeta) {
  const key = `${subject}/${moduleMeta.slug}`;
  const specific = CONTENT_MAP[key] || {};
  const hasTheory = Boolean(specific.theory);
  const hasVideos = Array.isArray(specific.videos);
  const theory = hasTheory ? { ...specific.theory } : fallbackTheory(moduleMeta);
  if (subject === 'discrete-math' && hasTheory && DISCRETE_MARKDOWN[moduleMeta.slug]) {
    theory.markdown = DISCRETE_MARKDOWN[moduleMeta.slug];
  }
  return {
    theory,
    videos: hasVideos ? specific.videos : fallbackVideos(subject, moduleMeta),
    meta: {
      isTheoryFallback: !hasTheory,
      isVideosFallback: !hasVideos,
    },
  };
}
