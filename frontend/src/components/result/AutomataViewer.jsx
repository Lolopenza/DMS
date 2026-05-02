import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CytoscapeComponent from 'react-cytoscapejs';
import { Cpu, Check, X, Play, ArrowRight } from 'lucide-react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';

/**
 * Finite automata visualization viewer.
 * Shows DFA/NFA state diagrams with transition highlighting.
 *
 * @param {string[]} states - List of state names
 * @param {string} startState - Initial state
 * @param {string[]} acceptStates - Accepting/final states
 * @param {Array<{from: string, to: string, symbol: string}>} transitions - Transition function
 * @param {string} testString - String being tested
 * @param {boolean} accepted - Whether the string was accepted
 * @param {string[]} executionPath - States visited during execution
 */
export default function AutomataViewer({
  states = [],
  startState = '',
  acceptStates = [],
  transitions = [],
  testString = '',
  accepted = null,
  executionPath = [],
}) {
  const cyRef = useRef(null);

  const elements = buildElements(states, startState, acceptStates, transitions, executionPath);

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': '#e2e8f0',
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '14px',
        'font-weight': 'bold',
        color: '#334155',
        width: 50,
        height: 50,
        'border-width': 2,
        'border-color': '#94a3b8',
      },
    },
    {
      selector: 'node.start',
      style: {
        'border-width': 3,
        'border-color': '#3b82f6',
      },
    },
    {
      selector: 'node.accept',
      style: {
        'background-color': '#dcfce7',
        'border-width': 4,
        'border-color': '#16a34a',
        'border-style': 'double',
      },
    },
    {
      selector: 'node.current',
      style: {
        'background-color': '#fbbf24',
        'border-color': '#d97706',
        width: 55,
        height: 55,
      },
    },
    {
      selector: 'node.visited',
      style: {
        'background-color': '#c7d2fe',
        'border-color': '#6366f1',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#94a3b8',
        'target-arrow-color': '#94a3b8',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '12px',
        color: '#475569',
        'text-background-color': '#ffffff',
        'text-background-opacity': 0.8,
        'text-background-padding': '3px',
        'edge-text-rotation': 'autorotate',
      },
    },
    {
      selector: 'edge.traversed',
      style: {
        'line-color': '#6366f1',
        'target-arrow-color': '#6366f1',
        width: 3,
      },
    },
    {
      selector: 'edge.loop',
      style: {
        'curve-style': 'unbundled-bezier',
        'control-point-step-size': 60,
      },
    },
  ];

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      {testString !== undefined && testString !== '' && accepted !== null && (
        <HighlightResult>
          <div
            className={`rounded-xl border-2 p-5 ${
              accepted
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:border-emerald-800 dark:from-emerald-900/90 dark:to-green-900/90'
                : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:border-red-800 dark:from-red-900/90 dark:to-rose-900/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Input String
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-800 dark:text-slate-200">
                  "{testString || 'ε'}"
                </p>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                  accepted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}
              >
                {accepted ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">Accepted</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5" />
                    <span className="font-semibold">Rejected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </HighlightResult>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            State Diagram
          </h3>
        </div>

        <div className="h-64 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          {elements.length > 0 ? (
            <CytoscapeComponent
              elements={elements}
              stylesheet={stylesheet}
              layout={{ name: 'circle', padding: 30 }}
              style={{ width: '100%', height: '100%' }}
              cy={(cy) => {
                cyRef.current = cy;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              No automaton data
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-blue-500 bg-slate-200" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Start state</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-4 border-double border-green-600 bg-green-100" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Accept state</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Current</span>
          </div>
        </div>
      </div>

      {executionPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Execution Path
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {executionPath.map((state, idx) => (
              <React.Fragment key={idx}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-lg px-3 py-1.5 font-mono text-sm font-medium ${
                    acceptStates.includes(state) && idx === executionPath.length - 1
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  }`}
                >
                  {state}
                </motion.span>
                {idx < executionPath.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          Automaton Definition
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              States (Q)
            </p>
            <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
              {`{${states.join(', ')}}`}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              Start State (q₀)
            </p>
            <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
              {startState}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              Accept States (F)
            </p>
            <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
              {`{${acceptStates.join(', ')}}`}
            </p>
          </div>
        </div>
      </div>
    </AnimatedResult>
  );
}

function buildElements(states, startState, acceptStates, transitions, executionPath) {
  const acceptSet = new Set(acceptStates);
  const visitedSet = new Set(executionPath.slice(0, -1));
  const currentState = executionPath.length > 0 ? executionPath[executionPath.length - 1] : null;

  const nodeElements = states.map((state) => {
    const classes = [];
    if (state === startState) classes.push('start');
    if (acceptSet.has(state)) classes.push('accept');
    if (state === currentState) classes.push('current');
    else if (visitedSet.has(state)) classes.push('visited');

    return {
      data: { id: state, label: state },
      classes: classes.join(' '),
    };
  });

  const transitionedEdges = new Set();
  for (let i = 0; i < executionPath.length - 1; i++) {
    transitionedEdges.add(`${executionPath[i]}-${executionPath[i + 1]}`);
  }

  const edgeElements = transitions.map((t, idx) => {
    const classes = [];
    if (t.from === t.to) classes.push('loop');
    if (transitionedEdges.has(`${t.from}-${t.to}`)) classes.push('traversed');

    return {
      data: {
        id: `e${idx}`,
        source: t.from,
        target: t.to,
        label: t.symbol || 'ε',
      },
      classes: classes.join(' '),
    };
  });

  return [...nodeElements, ...edgeElements];
}
