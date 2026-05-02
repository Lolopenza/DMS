import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Info } from 'lucide-react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';
import TruthTableViewer, { detectClassification } from './TruthTableViewer.jsx';
import CombinatoricsViewer from './CombinatoricsViewer.jsx';
import SetViewer from './SetViewer.jsx';
import GraphPathViewer from './GraphPathViewer.jsx';
import DistributionChart, { ProbabilityResult } from './DistributionChart.jsx';
import StepSolutionViewer from './StepSolutionViewer.jsx';
import MatrixViewer, { DeterminantResult } from './MatrixViewer.jsx';
import NumberTheoryViewer from './NumberTheoryViewer.jsx';
import AutomataViewer from './AutomataViewer.jsx';
import GraphStatsViewer from './GraphStatsViewer.jsx';
import 'katex/dist/katex.min.css';

function KaTeX({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

/**
 * Main unified result viewer that auto-detects result type and routes to
 * the appropriate specialized viewer.
 *
 * @param {any} data - The result data from the API
 * @param {string} module - Module identifier (e.g., 'combinatorics', 'graph-theory')
 * @param {string} operation - Operation identifier (e.g., 'factorial', 'bfs')
 * @param {object} params - Input parameters used for the calculation
 */
export default function MathResultViewer({ data, module, operation, params = {} }) {
  if (data === null || data === undefined) {
    return <EmptyResult />;
  }

  if (data?.error) {
    return <ErrorResult error={data.error} />;
  }

  const resultType = detectResultType(data, module, operation);

  switch (resultType) {
    case 'truth-table':
      return (
        <TruthTableViewer
          headers={data.headers || data.variables || []}
          rows={data.rows || data.table || []}
          formula={data.formula || params.formula}
          classification={data.classification || detectClassification(data.rows || data.table)}
        />
      );

    case 'combinatorics':
      return (
        <CombinatoricsViewer
          operation={operation}
          params={params}
          result={data}
        />
      );

    case 'set':
      return (
        <SetViewer
          operation={operation}
          inputs={{
            setA: params.setA || params.set_a,
            setB: params.setB || params.set_b,
            universe: params.universe,
            relation: params.relation,
          }}
          result={data}
        />
      );

    case 'graph-stats':
      return <GraphStatsViewer data={data} />;

    case 'graph':
      return (
        <GraphPathViewer
          edges={data.edges || extractEdges(data, params)}
          path={data.path || data.shortest_path || []}
          visitedOrder={data.visited || data.traversal_order || data.order || []}
          operation={operation}
          stats={extractGraphStats(data)}
          directed={params.directed === 'true' || params.directed === true}
        />
      );

    case 'probability':
      if (params.favorable && params.total) {
        return (
          <ProbabilityResult
            favorable={Number(params.favorable)}
            total={Number(params.total)}
            probability={data.result || data.probability || data}
          />
        );
      }
      return (
        <DistributionChart
          probability={data.result || data.probability || data}
          data={data.distribution || []}
          title={getOperationTitle(operation)}
        />
      );

    case 'matrix':
      if (operation === 'determinant' && data.determinant !== undefined) {
        return (
          <DeterminantResult
            matrix={params.matrix || parseMatrix(params.matrixA)}
            determinant={data.determinant}
            steps={data.steps}
          />
        );
      }
      return (
        <MatrixViewer
          matrix={data.result || data.matrix || data}
          label={getMatrixLabel(operation)}
          operation={operation}
        />
      );

    case 'number-theory':
      return (
        <NumberTheoryViewer
          operation={operation}
          params={params}
          result={data}
        />
      );

    case 'automata':
      return (
        <AutomataViewer
          states={data.states || params.states?.split(',').map((s) => s.trim()) || []}
          startState={data.start_state || params.startState}
          acceptStates={data.accept_states || params.acceptStates?.split(',').map((s) => s.trim()) || []}
          transitions={data.transitions || []}
          testString={params.testString}
          accepted={data.accepted}
          executionPath={data.path || data.execution_path || []}
        />
      );

    case 'steps':
      return (
        <StepSolutionViewer
          steps={normalizeStepsPayload(data)}
          title={getOperationTitle(operation)}
        />
      );

    case 'simple':
    default:
      return <SimpleResult data={data} operation={operation} params={params} />;
  }
}

function detectResultType(data, module, operation) {
  if (data.headers || data.table || (data.rows && data.variables)) {
    return 'truth-table';
  }

  if (
    data &&
    typeof data.num_vertices === 'number' &&
    Array.isArray(data.degrees)
  ) {
    return 'graph-stats';
  }

  if (module === 'combinatorics' ||
      ['factorial', 'permutation', 'combination', 'binomial', 'catalan', 'stirling', 'pigeonhole'].includes(operation)) {
    return 'combinatorics';
  }

  if (module === 'set-theory' ||
      ['union', 'intersection', 'difference', 'complement', 'cartesian', 'powerset', 'cardinality', 'inverse', 'closure', 'properties', 'symmetric_difference'].includes(operation)) {
    return 'set';
  }

  if (module === 'graph-theory' ||
      ['bfs', 'dfs', 'dijkstra', 'mst', 'shortest_path', 'topological_sort', 'connected_components', 'adjacency_matrix'].includes(operation) ||
      data.edges || data.path || data.traversal_order || data.visited) {
    return 'graph';
  }

  if (module === 'probability' ||
      ['basic_probability', 'conditional', 'bayes', 'binomial_dist', 'poisson'].includes(operation) ||
      data.probability !== undefined) {
    return 'probability';
  }

  if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0][0] === 'number') {
    return 'matrix';
  }
  if (data.matrix || data.determinant !== undefined || data.eigenvalues || data.inverse) {
    return 'matrix';
  }

  if (module === 'number-theory' ||
      ['gcd', 'lcm', 'prime_factors', 'is_prime', 'mod_exp', 'extended_gcd', 'euler_phi', 'divisors', 'fibonacci'].includes(operation)) {
    return 'number-theory';
  }

  if (module === 'automata' ||
      ['simulate', 'minimize', 'nfa_to_dfa', 'test_string'].includes(operation) ||
      data.accepted !== undefined || data.states) {
    return 'automata';
  }

  if (Array.isArray(data.steps) && data.steps.length > 0) {
    return 'steps';
  }

  if (typeof data.steps === 'string' && data.steps.trim()) {
    return 'steps';
  }

  return 'simple';
}

/** Builds StepSolutionViewer steps from API payloads (array or prose string). */
function normalizeStepsPayload(data) {
  const raw = data?.steps ?? formatSteps(data);
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string' && raw.trim()) {
    return [{ explanation: raw.trim() }];
  }
  return [];
}

function SimpleResult({ data, operation, params }) {
  const [copied, setCopied] = React.useState(false);
  const resultValue = data?.result ?? data;

  const copyResult = () => {
    const text = typeof resultValue === 'object'
      ? JSON.stringify(resultValue, null, 2)
      : String(resultValue);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {getOperationTitle(operation) || 'Result'}
              </span>
            </div>
            <button
              onClick={copyResult}
              className="flex items-center gap-1 rounded-lg bg-white/50 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-3">
            {renderSimpleValue(resultValue)}
          </div>
        </div>
      </HighlightResult>

      {typeof data === 'object' && data !== null && Object.keys(data).length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Full Response
          </p>
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900"
              >
                <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {key}:
                </span>
                <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                  {renderSimpleValue(value)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </AnimatedResult>
  );
}

function renderSimpleValue(value) {
  if (value === null || value === undefined) {
    return <span className="text-slate-400">null</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <span
        className={`text-2xl font-bold ${
          value
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {value ? 'True' : 'False'}
      </span>
    );
  }

  if (typeof value === 'number') {
    return (
      <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
        {Number.isInteger(value) ? value.toLocaleString() : value.toFixed(6)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-xl text-slate-500">[]</span>;
    }
    if (value.length <= 20) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-lg bg-indigo-100 px-2 py-1 font-mono text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            >
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </motion.span>
          ))}
        </div>
      );
    }
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  if (typeof value === 'object') {
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
      {String(value)}
    </span>
  );
}

function EmptyResult() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <Info className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Fill in the parameters and run the calculation.
      </p>
    </div>
  );
}

function ErrorResult({ error }) {
  return (
    <AnimatedResult variant="slideUp">
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
        <p className="font-medium text-red-700 dark:text-red-400">Error</p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{String(error)}</p>
      </div>
    </AnimatedResult>
  );
}

function getOperationTitle(operation) {
  const titles = {
    factorial: 'Factorial',
    permutation: 'Permutation',
    combination: 'Combination',
    binomial: 'Binomial Coefficient',
    catalan: 'Catalan Number',
    stirling: 'Stirling Number',
    pigeonhole: 'Pigeonhole Principle',
    union: 'Set Union',
    intersection: 'Set Intersection',
    difference: 'Set Difference',
    complement: 'Set Complement',
    bfs: 'Breadth-First Search',
    dfs: 'Depth-First Search',
    dijkstra: 'Shortest Path',
    mst: 'Minimum Spanning Tree',
    gcd: 'Greatest Common Divisor',
    lcm: 'Least Common Multiple',
    prime_factors: 'Prime Factorization',
    is_prime: 'Primality Test',
    determinant: 'Determinant',
    inverse: 'Matrix Inverse',
    eigenvalues: 'Eigenvalues',
  };
  return titles[operation] || operation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getMatrixLabel(operation) {
  const labels = {
    add: 'Sum',
    subtract: 'Difference',
    multiply: 'Product',
    inverse: 'Inverse',
    transpose: 'Transpose',
    rref: 'Row Echelon Form',
  };
  return labels[operation] || 'Result';
}

function extractEdges(data, params) {
  if (data.edge_list) {
    return data.edge_list.map(([source, target, weight]) => ({
      source: String(source),
      target: String(target),
      weight,
    }));
  }
  return [];
}

function extractGraphStats(data) {
  const stats = {};
  if (data.num_nodes !== undefined) stats.nodes = data.num_nodes;
  if (data.num_edges !== undefined) stats.edges = data.num_edges;
  if (data.is_connected !== undefined) stats.connected = data.is_connected;
  if (data.total_weight !== undefined) stats.total_weight = data.total_weight;
  if (data.distance !== undefined) stats.distance = data.distance;
  return stats;
}

function parseMatrix(text) {
  if (!text) return [];
  return text.split('\n').map((row) =>
    row.split(/[,;\s]+/).filter(Boolean).map(Number)
  );
}

function formatSteps(data) {
  if (data.steps) return data.steps;
  return [];
}
