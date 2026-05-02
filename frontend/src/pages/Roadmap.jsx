import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';
import { CALCULATOR_PATH } from '../routes.js';
import { Badge, Button, Card, CardHeader } from '../components/ui/index.js';

const steps = [
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

const BADGE_LABELS = { alt: 'Alternatives', opt: 'Optional' };
const ITEM_COLORS = { alt: '#a855f7', opt: '#eab308', default: '#22c55e' };

export default function Roadmap() {
  const { showSuccess } = useToast();

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Discrete Mathematics Roadmap', url: window.location.href });
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
            Discrete Mathematics
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Roadmap</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
            Step-by-step guide to becoming confident in logic, sets, combinatorics, and graph theory.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button size="lg" variant="outline">
                <i className="fas fa-arrow-left" /> Back to home
              </Button>
            </Link>
            <Link to={CALCULATOR_PATH}>
              <Button size="lg">
                <i className="fas fa-calculator" /> Open calculator
              </Button>
            </Link>
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
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h2>
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
