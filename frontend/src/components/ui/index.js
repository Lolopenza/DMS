/**
 * UI-Kit — централизованная дизайн-система Math Lab Platform.
 * 
 * Все компоненты поддерживают:
 * - Dark mode (автоматически через Tailwind dark:)
 * - Кастомизацию через className prop
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Responsive design
 */

export { default as Button, ButtonGroup } from './Button.jsx';
export { default as Card, CardHeader, CardSection } from './Card.jsx';
export { default as Badge } from './Badge.jsx';
export { default as Input, Textarea, Select } from './Input.jsx';
export { default as MathInput, MatrixInput, parseMatrixLatex, formatMatrixLatex } from './MathInput.jsx';
export { default as Chart, AlgorithmVisualization, FunctionPlot, ComparisonChart } from './Chart.jsx';
