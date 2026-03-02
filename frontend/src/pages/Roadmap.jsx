import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

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

  useEffect(() => {
    document.body.classList.add('roadmap-page');
    return () => document.body.classList.remove('roadmap-page');
  }, []);

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Discrete Mathematics Roadmap', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  }

  return (
    <>
      <header className="roadmap-hero">
        <h1>Discrete Mathematics Roadmap</h1>
        <p>Step by step guide to becoming a Discrete Mathematics Developer.</p>
        <div className="roadmap-actions">
          <Link to="/" className="roadmap-btn roadmap-btn-back">
            <i className="fas fa-arrow-left"></i> Back to home
          </Link>
          <Link to="/calculator" className="roadmap-btn roadmap-btn-ai">
            <i className="fas fa-calculator"></i> Open Calculator
          </Link>
          <button type="button" className="roadmap-btn roadmap-btn-share" onClick={share}>
            <i className="fas fa-share-nodes"></i> Share
          </button>
        </div>
      </header>

      <div className="roadmap-content">
        <div className="roadmap-legend">
          <h3>Legend</h3>
          <div className="roadmap-legend-item">
            <span className="roadmap-legend-dot green"></span> Recommended
          </div>
          <div className="roadmap-legend-item">
            <span className="roadmap-legend-dot purple"></span> Alternatives
          </div>
          <div className="roadmap-legend-item">
            <span className="roadmap-legend-dot yellow"></span> Optional
          </div>
        </div>

        <div className="roadmap-timeline">
          {steps.map(step => (
            <article key={step.num} className="roadmap-step">
              <div className="roadmap-step-card">
                <div className="roadmap-step-header">
                  <span className="roadmap-step-num">{step.num}</span>
                  <div className="roadmap-step-title-wrap">
                    <h2 className="roadmap-step-title">{step.title}</h2>
                  </div>
                </div>
                <p className="roadmap-step-desc">{step.desc}</p>
                <ul className="roadmap-step-list">
                  {step.items.map((item, i) => (
                    <li
                      key={i}
                      className={item.type ? `roadmap-sub-${item.type}` : ''}
                      style={{ '--item-color': ITEM_COLORS[item.type || 'default'] }}
                    >
                      {item.text}
                      {item.type && (
                        <span className={`roadmap-badge roadmap-badge-${item.type}`}>
                          {BADGE_LABELS[item.type]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
