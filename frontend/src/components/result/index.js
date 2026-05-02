// Result viewer components - unified visual presentation for calculator results

// Main auto-routing viewer
export { default as MathResultViewer } from './MathResultViewer.jsx';

// Animation wrapper
export {
  default as AnimatedResult,
  AnimatedList,
  HighlightResult,
  AnimatedSteps,
  AnimatedNumber,
} from './AnimatedResult.jsx';

// Specialized viewers
export { default as TruthTableViewer, detectClassification } from './TruthTableViewer.jsx';
export { default as CombinatoricsViewer } from './CombinatoricsViewer.jsx';
export { default as SetViewer } from './SetViewer.jsx';
export { default as GraphPathViewer } from './GraphPathViewer.jsx';
export { default as GraphStatsViewer } from './GraphStatsViewer.jsx';
export { default as DistributionChart, ProbabilityResult } from './DistributionChart.jsx';
export { default as StepSolutionViewer, CompactSteps } from './StepSolutionViewer.jsx';
export { default as MatrixViewer, MatrixComparison, DeterminantResult } from './MatrixViewer.jsx';
export { default as NumberTheoryViewer } from './NumberTheoryViewer.jsx';
export { default as AutomataViewer } from './AutomataViewer.jsx';
export { default as CalculusSymPyViewer } from './CalculusSymPyViewer.jsx';
