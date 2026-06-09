import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';
import { DEFAULT_SUBJECT, getSubjectCatalog } from '../routes.js';
import { Badge, Button, Card, CardHeader, OpenCalculatorLink } from '../components/ui/index.js';

const DISCRETE_MATH_STEPS = [
  {
    num: 1, title: 'General Introduction',
    desc: 'Understand the importance and scope of applications of Discrete Mathematics.',
    items: [
      { text: 'Role in Computer Science' },
      { text: 'Practical Applications' },
    ],
  },
  {
    num: 2, title: 'Mathematical Logic and Propositions',
    desc: 'The foundation of all reasoning and proofs in mathematics and computer science.',
    items: [
      { text: 'Propositions and logical operations' },
      { text: 'Logical laws, truth tables', type: 'alt' },
      { text: 'Theorems, proofs (contradiction, induction)' },
    ],
  },
  {
    num: 3, title: 'Sets and Relations',
    desc: 'Learn how to group objects and define relationships between them.',
    items: [
      { text: 'Set concepts, operations on sets' },
      { text: 'Relations, properties of relations' },
      { text: 'Equivalence relations, order relations' },
    ],
  },
  {
    num: 4, title: 'Functions and Mappings',
    desc: 'Study the rules of correspondence between sets.',
    items: [
      { text: 'Definition, domain, range' },
      { text: '1-1, onto, bijective functions', type: 'alt' },
      { text: 'Composite functions, inverse functions' },
    ],
  },
  {
    num: 5, title: 'Boolean Algebra',
    desc: 'Explore the mathematical system of logic and its application in computers.',
    items: [
      { text: 'Boolean algebra structure' },
      { text: 'Representation and minimization of logic expressions' },
      { text: 'Application in digital circuit design', type: 'opt' },
    ],
  },
  {
    num: 6, title: 'Discrete Arithmetic',
    desc: 'Study the properties of integers and their application in cryptography.',
    items: [
      { text: 'Divisibility, prime numbers, GCD' },
      { text: 'Euclidean algorithm' },
      { text: 'Residues, congruence and its applications (RSA cryptography)' },
    ],
  },
  {
    num: 7, title: 'Combinatorics and Discrete Probability',
    desc: 'Learn counting techniques and analyze the likelihood of events.',
    items: [
      { text: 'Counting rules: sum, product' },
      { text: 'Permutations, arrangements, combinations' },
      { text: 'Discrete probability' },
    ],
  },
  {
    num: 8, title: 'Recurrence Relations and Generating Functions',
    desc: 'Model problems that have recursive properties.',
    items: [
      { text: 'Definition of recurrence relations' },
      { text: 'Methods for solving linear recurrence relations' },
      { text: 'Generating functions', type: 'alt' },
    ],
  },
  {
    num: 9, title: 'Graph Theory',
    desc: 'The foundation for modeling networks and relationships.',
    items: [
      { text: 'Graph concepts, paths, cycles' },
      { text: 'Trees, spanning trees, binary trees' },
      { text: 'Eulerian, Hamiltonian algorithms' },
    ],
  },
  {
    num: 10, title: 'Relational Algebra and Formal Languages',
    desc: 'The theoretical basis for databases and compilers.',
    items: [
      { text: 'Formal languages, Grammars' },
      { text: 'Regular expression', type: 'opt' },
      { text: 'Applications: finite automata, compilers' },
    ],
  },
  {
    num: 11, title: 'Complexity Theory (optional)',
    desc: 'Evaluate the efficiency of algorithms.',
    items: [
      { text: 'Time and space complexity' },
      { text: 'P vs NP problem', type: 'opt' },
      { text: 'NP-complete problems', type: 'opt' },
    ],
  },
];

const ROADMAPS = {
  'discrete-math': {
    label: 'Discrete Mathematics',
    subtitle: 'Step-by-step guide to becoming confident in logic, sets, combinatorics, and graph theory.',
    steps: DISCRETE_MATH_STEPS,
  },
  'linear-algebra': {
    label: 'Linear Algebra',
    subtitle: 'Build from vectors and matrices through eigenvalues, transformations, and orthogonality.',
    steps: [
      {
        num: 1, title: 'Vectors', moduleSlug: 'vectors',
        desc: 'Geometric intuition and algebraic operations in n-dimensional space.',
        items: [
          { text: 'Vector addition, scalar multiplication' },
          { text: 'Dot product and geometric interpretation' },
          { text: 'Norms and unit vectors', type: 'alt' },
        ],
      },
      {
        num: 2, title: 'Matrices', moduleSlug: 'matrices',
        desc: 'Represent linear maps and systems with rectangular arrays.',
        items: [
          { text: 'Matrix arithmetic and properties' },
          { text: 'Rank, inverse, and elementary row operations' },
          { text: 'Block matrices', type: 'opt' },
        ],
      },
      {
        num: 3, title: 'Linear Systems', moduleSlug: 'linear-systems',
        desc: 'Solve Ax = b using elimination and interpret solutions geometrically.',
        items: [
          { text: 'Gaussian elimination' },
          { text: 'Consistent vs inconsistent systems' },
          { text: 'Parametric solution sets', type: 'alt' },
        ],
      },
      {
        num: 4, title: 'Determinants', moduleSlug: 'determinants',
        desc: 'Measure scaling, orientation, and invertibility of linear maps.',
        items: [
          { text: '2×2 and 3×3 determinants' },
          { text: 'Cofactor expansion and properties' },
          { text: 'Cramer’s rule', type: 'opt' },
        ],
      },
      {
        num: 5, title: 'Eigenvalues & Eigenvectors', moduleSlug: 'eigenvalues',
        desc: 'Find invariant directions and spectral structure of matrices.',
        items: [
          { text: 'Characteristic polynomial' },
          { text: 'Diagonalization (when possible)' },
          { text: 'Applications in stability and PCA', type: 'alt' },
        ],
      },
      {
        num: 6, title: 'Linear Transformations', moduleSlug: 'linear-transformations',
        desc: 'Connect matrices to functions between vector spaces.',
        items: [
          { text: 'Kernel and image' },
          { text: 'Composition and change of basis' },
          { text: 'Rotation, reflection, projection examples' },
        ],
      },
      {
        num: 7, title: 'Vector Spaces', moduleSlug: 'vector-spaces',
        desc: 'Abstract structure: span, basis, dimension, and subspaces.',
        items: [
          { text: 'Linear independence' },
          { text: 'Basis and dimension' },
          { text: 'Direct sums', type: 'opt' },
        ],
      },
      {
        num: 8, title: 'Orthogonality', moduleSlug: 'orthogonality',
        desc: 'Inner products, projections, and least-squares foundations.',
        items: [
          { text: 'Orthogonal and orthonormal bases' },
          { text: 'Gram–Schmidt process', type: 'alt' },
          { text: 'Orthogonal projections and least squares' },
        ],
      },
    ],
  },
  algorithms: {
    label: 'Algorithms & Data Structures',
    subtitle: 'From asymptotic analysis through classic algorithm design paradigms.',
    steps: [
      {
        num: 1, title: 'Asymptotic Analysis', moduleSlug: 'asymptotic-analysis',
        desc: 'Reason about growth rates and compare algorithm efficiency.',
        items: [
          { text: 'Big-O, Big-Θ, Big-Ω notation' },
          { text: 'Worst vs average case' },
          { text: 'Amortized analysis intro', type: 'opt' },
        ],
      },
      {
        num: 2, title: 'Sorting', moduleSlug: 'sorting',
        desc: 'Classic comparison and divide-and-conquer sorting strategies.',
        items: [
          { text: 'Bubble, insertion, selection sort' },
          { text: 'Merge sort and quicksort' },
          { text: 'Stability and in-place trade-offs', type: 'alt' },
        ],
      },
      {
        num: 3, title: 'Searching', moduleSlug: 'searching',
        desc: 'Locate elements in linear and sorted structures.',
        items: [
          { text: 'Linear search' },
          { text: 'Binary search on sorted arrays' },
          { text: 'Search on graphs (preview)', type: 'alt' },
        ],
      },
      {
        num: 4, title: 'String Algorithms', moduleSlug: 'string-algorithms',
        desc: 'Pattern matching and text processing fundamentals.',
        items: [
          { text: 'Naive string search' },
          { text: 'Substring and prefix ideas' },
          { text: 'Recursion in string problems', type: 'alt' },
        ],
      },
      {
        num: 5, title: 'Divide & Conquer', moduleSlug: 'divide-conquer',
        desc: 'Split problems, solve subproblems, and combine results.',
        items: [
          { text: 'Merge sort as template' },
          { text: 'Master theorem intuition' },
          { text: 'Closest pair / Karatsuba examples', type: 'alt' },
        ],
      },
      {
        num: 6, title: 'Dynamic Programming', moduleSlug: 'dynamic-programming',
        desc: 'Optimal substructure with overlapping subproblems.',
        items: [
          { text: 'Memoization vs tabulation' },
          { text: 'Fibonacci, coin change' },
          { text: 'Knapsack variants', type: 'alt' },
        ],
      },
      {
        num: 7, title: 'Greedy Algorithms', moduleSlug: 'greedy',
        desc: 'Make locally optimal choices with proof of correctness.',
        items: [
          { text: 'Activity selection / interval scheduling' },
          { text: 'Huffman coding intuition', type: 'opt' },
          { text: 'When greedy fails', type: 'alt' },
        ],
      },
      {
        num: 8, title: 'Graph Algorithms', moduleSlug: 'graph-algorithms',
        desc: 'Traverse and analyze networks with BFS, DFS, and shortest paths.',
        items: [
          { text: 'BFS and DFS' },
          { text: 'Connected components and cycles' },
          { text: 'Dijkstra / shortest paths', type: 'alt' },
        ],
      },
    ],
  },
  'probability-statistics': {
    label: 'Probability & Statistics',
    subtitle: 'From counting foundations through conditional probability and distributions.',
    steps: [
      {
        num: 1, title: 'Combinatorics Prerequisites',
        desc: 'Count outcomes before assigning probabilities.',
        items: [
          { text: 'Sample spaces and events' },
          { text: 'Permutations and combinations review' },
          { text: 'Discrete Math combinatorics module', type: 'alt' },
        ],
      },
      {
        num: 2, title: 'Probability Basics', moduleSlug: 'probability-basics',
        desc: 'Axioms, rules, and elementary discrete probability.',
        items: [
          { text: 'Addition and multiplication rules' },
          { text: 'Complements and independence intro' },
          { text: 'Uniform discrete models' },
        ],
      },
      {
        num: 3, title: 'Conditional Probability', moduleSlug: 'conditional-probability',
        desc: 'Update beliefs when new evidence arrives.',
        items: [
          { text: 'P(A|B) and joint probabilities' },
          { text: 'Law of total probability' },
          { text: 'Tree diagrams', type: 'alt' },
        ],
      },
      {
        num: 4, title: "Bayes' Theorem", moduleSlug: 'bayes-theorem',
        desc: 'Invert conditional probabilities for inference.',
        items: [
          { text: 'Prior, likelihood, posterior' },
          { text: 'Medical testing / spam filter examples' },
          { text: 'Bayesian updating', type: 'opt' },
        ],
      },
      {
        num: 5, title: 'Distributions', moduleSlug: 'distributions',
        desc: 'Model random variables with standard discrete laws.',
        items: [
          { text: 'Binomial distribution' },
          { text: 'Poisson and geometric', type: 'alt' },
          { text: 'Expectation and variance', type: 'opt' },
        ],
      },
    ],
  },
  'it-logic': {
    label: 'Logic & Computation',
    subtitle: 'Formal logic from propositions through boolean algebra and automata.',
    steps: [
      {
        num: 1, title: 'Propositional Logic', moduleSlug: 'propositional-logic',
        desc: 'Syntax, semantics, and classification of logical formulas.',
        items: [
          { text: 'Connectives and well-formed formulas' },
          { text: 'Tautologies and contradictions' },
          { text: 'Normal forms preview', type: 'alt' },
        ],
      },
      {
        num: 2, title: 'Truth Tables', moduleSlug: 'truth-tables',
        desc: 'Exhaustively evaluate formulas under all assignments.',
        items: [
          { text: 'Construct full truth tables' },
          { text: 'Identify satisfiability' },
          { text: 'Short-circuit evaluation', type: 'opt' },
        ],
      },
      {
        num: 3, title: 'Equivalence Laws', moduleSlug: 'equivalence-laws',
        desc: 'Rewrite formulas using logical identities.',
        items: [
          { text: 'De Morgan, distributive, absorption laws' },
          { text: 'Check equivalence of two formulas' },
          { text: 'DNF / CNF conversion', type: 'alt' },
        ],
      },
      {
        num: 4, title: 'Boolean Algebra', moduleSlug: 'boolean-algebra',
        desc: 'Algebraic structure behind digital logic and circuits.',
        items: [
          { text: 'Boolean operators and identities' },
          { text: 'Simplification techniques' },
          { text: 'Karnaugh maps', type: 'opt' },
        ],
      },
      {
        num: 5, title: 'Automata Theory', moduleSlug: 'automata',
        desc: 'Finite-state machines as models of computation.',
        items: [
          { text: 'DFA and NFA definitions' },
          { text: 'State transitions and acceptance' },
          { text: 'Regular languages preview', type: 'alt' },
        ],
      },
    ],
  },
  calculus: {
    label: 'Calculus',
    subtitle: 'Limits through differential equations for engineering and science.',
    steps: [
      {
        num: 1, title: 'Limits & Continuity', moduleSlug: 'limits-continuity',
        desc: 'Approach values and classify function behavior at boundaries.',
        items: [
          { text: 'Limit laws and standard limits' },
          { text: 'Continuity and discontinuities' },
          { text: 'L’Hôpital’s rule', type: 'alt' },
        ],
      },
      {
        num: 2, title: 'Derivatives', moduleSlug: 'derivatives',
        desc: 'Instantaneous rate of change and differentiation rules.',
        items: [
          { text: 'Definition and basic rules' },
          { text: 'Chain, product, quotient rules' },
          { text: 'Applications: tangents, optimization', type: 'alt' },
        ],
      },
      {
        num: 3, title: 'Integrals', moduleSlug: 'integrals',
        desc: 'Accumulation, antiderivatives, and area under curves.',
        items: [
          { text: 'Definite and indefinite integrals' },
          { text: 'Substitution and basic techniques' },
          { text: 'Fundamental theorem of calculus' },
        ],
      },
      {
        num: 4, title: 'Series', moduleSlug: 'series',
        desc: 'Infinite sums, convergence, and Taylor expansions.',
        items: [
          { text: 'Geometric and p-series tests' },
          { text: 'Taylor and Maclaurin series', type: 'alt' },
          { text: 'Radius of convergence', type: 'opt' },
        ],
      },
      {
        num: 5, title: 'Multivariable Calculus', moduleSlug: 'multivariable',
        desc: 'Partial derivatives and gradients in several variables.',
        items: [
          { text: 'Partial derivatives' },
          { text: 'Gradient and directional derivatives' },
          { text: 'Multiple integrals intro', type: 'opt' },
        ],
      },
      {
        num: 6, title: 'Differential Equations', moduleSlug: 'differential-equations',
        desc: 'Model change over time with ODEs and initial conditions.',
        items: [
          { text: 'Separable and linear first-order ODEs' },
          { text: 'Exponential growth/decay models' },
          { text: 'Direction fields', type: 'alt' },
        ],
      },
    ],
  },
};

const BADGE_LABELS = { alt: 'Alternatives', opt: 'Optional' };

function resolveRoadmap(subjectSlug) {
  const slug = subjectSlug || DEFAULT_SUBJECT;
  return ROADMAPS[slug] || ROADMAPS[DEFAULT_SUBJECT];
}

export default function Roadmap() {
  const { subject: subjectParam } = useParams();
  const { showSuccess } = useToast();
  const catalog = getSubjectCatalog();
  const subjectSlug = subjectParam || DEFAULT_SUBJECT;
  const track = catalog.find((item) => item.slug === subjectSlug);
  const roadmap = resolveRoadmap(subjectSlug);
  const label = track?.label || roadmap.label;
  const calculatorPath = track?.calculatorPath || `/${subjectSlug}/calculator`;
  const steps = roadmap.steps;

  function share() {
    const title = `${label} Roadmap`;
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  }

  return (
    <section className="min-h-screen bg-[var(--dmc-bg-page)] text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Roadmap</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            {roadmap.subtitle}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button size="lg" variant="outline">
                <i className="fas fa-arrow-left" /> Back to home
              </Button>
            </Link>
            <OpenCalculatorLink to={calculatorPath} size="lg" fullWidth={false} className="w-full sm:w-auto" />
            <Button size="lg" variant="secondary" onClick={share}>
              <i className="fas fa-share-nodes" /> Share
            </Button>
          </div>
        </header>

        <section className="mt-10">
          <Card variant="elevated" padding="lg">
            <CardHeader title="Legend" subtitle="How to read the roadmap items." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge tone="success">Recommended</Badge>
              <Badge tone="neutral">Alternatives</Badge>
              <Badge tone="warning">Optional</Badge>
            </div>
          </Card>
        </section>

        <section className="mt-10 space-y-5">
          {steps.map((step) => (
            <Card key={step.num} variant="elevated" padding="lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500">
                      {step.num}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {step.moduleSlug ? (
                          <Link
                            to={`/${subjectSlug}/${step.moduleSlug}`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {step.title}
                          </Link>
                        ) : (
                          step.title
                        )}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {step.items.map((item, idx) => {
                  const tone = item.type === 'opt' ? 'warning' : item.type === 'alt' ? 'neutral' : 'success';
                  const border =
                    item.type === 'opt'
                      ? 'border-amber-300 dark:border-amber-700'
                      : item.type === 'alt'
                        ? 'border-violet-300 dark:border-violet-700'
                        : 'border-emerald-300 dark:border-emerald-700';
                  return (
                    <li
                      key={idx}
                      className={`flex items-start justify-between gap-4 rounded-2xl border ${border} bg-white px-4 py-3 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-200`}
                    >
                      <span className="min-w-0">{item.text}</span>
                      {item.type ? <Badge tone={tone}>{BADGE_LABELS[item.type]}</Badge> : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </section>
      </div>
    </section>
  );
}
