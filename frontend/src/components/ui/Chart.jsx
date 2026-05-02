import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useIsDarkMode from '../../hooks/useIsDarkMode.js';
import { getRechartsPalette } from '../../lib/rechartsTheme.js';

/**
 * Chart — универсальный компонент для графиков.
 * Использует Recharts для профессиональной визуализации.
 * 
 * @param {string} type - 'line' | 'bar' | 'scatter'
 * @param {Array} data - массив данных [{x, y}, ...]
 * @param {string} xKey - ключ для оси X (default: 'x')
 * @param {string} yKey - ключ для оси Y (default: 'y')
 * @param {string} title - заголовок графика
 * @param {string} xLabel - подпись оси X
 * @param {string} yLabel - подпись оси Y
 * @param {number} height - высота графика в px (default: 400)
 * @param {string} color - цвет линии/баров (default: indigo)
 * @param {boolean} showGrid - показывать сетку (default: true)
 * @param {boolean} showLegend - показывать легенду (default: false)
 */
export default function Chart({
  type = 'line',
  data = [],
  xKey = 'x',
  yKey = 'y',
  title = null,
  xLabel = null,
  yLabel = null,
  height = 400,
  color = '#6366f1',
  showGrid = true,
  showLegend = false,
  className = '',
}) {
  const isDark = useIsDarkMode();
  const rc = getRechartsPalette(isDark);

  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    scatter: ScatterChart,
  }[type];

  const DataComponent = {
    line: Line,
    bar: Bar,
    scatter: Scatter,
  }[type];

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke={rc.gridStroke} />
            )}
            <XAxis
              dataKey={xKey}
              label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
              stroke={rc.axisLabelFill}
              tick={{ fill: rc.tickFill }}
            />
            <YAxis
              dataKey={yKey}
              label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
              stroke={rc.axisLabelFill}
              tick={{ fill: rc.tickFill }}
            />
            <Tooltip contentStyle={rc.tooltipStyle} />
            {showLegend && <Legend />}
            <DataComponent
              type={type === 'line' ? 'monotone' : undefined}
              dataKey={yKey}
              stroke={color}
              fill={color}
              strokeWidth={2}
              dot={type === 'line' ? { fill: color, r: 4 } : undefined}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * AlgorithmVisualization — специализированный компонент для визуализации алгоритмов.
 * Показывает шаги выполнения алгоритма с анимацией.
 */
export function AlgorithmVisualization({
  steps = [],
  currentStep = 0,
  title = 'Algorithm Execution',
  className = '',
}) {
  if (!steps.length) return null;

  const step = steps[currentStep];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Array visualization */}
      {step?.array && (
        <div className="flex gap-2 justify-center flex-wrap">
          {step.array.map((value, idx) => (
            <div
              key={idx}
              className={`
                w-12 h-12 flex items-center justify-center
                rounded-lg font-mono font-semibold
                transition-all duration-300
                ${step.highlight?.includes(idx)
                  ? 'bg-indigo-500 text-white scale-110 shadow-lg'
                  : step.sorted?.includes(idx)
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                }
              `}
            >
              {value}
            </div>
          ))}
        </div>
      )}

      {/* Step description */}
      {step?.description && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {step.description}
          </p>
        </div>
      )}

      {/* Metrics */}
      {step?.metrics && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(step.metrics).map(([key, value]) => (
            <div
              key={key}
              className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {key}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FunctionPlot — график математической функции.
 * Автоматически вычисляет точки для плавной кривой.
 */
export function FunctionPlot({
  func,
  xMin = -10,
  xMax = 10,
  points = 100,
  title = 'Function Plot',
  xLabel = 'x',
  yLabel = 'f(x)',
  color = '#6366f1',
  className = '',
}) {
  // Generate data points
  const data = [];
  const step = (xMax - xMin) / points;
  
  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = func(x);
      if (isFinite(y)) {
        data.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
      }
    } catch (err) {
      // Skip invalid points
    }
  }

  return (
    <Chart
      type="line"
      data={data}
      title={title}
      xLabel={xLabel}
      yLabel={yLabel}
      color={color}
      className={className}
    />
  );
}

/**
 * ComparisonChart — сравнение нескольких наборов данных.
 */
export function ComparisonChart({
  datasets = [],
  xKey = 'x',
  title = 'Comparison',
  xLabel = null,
  yLabel = null,
  height = 400,
  className = '',
}) {
  const isDark = useIsDarkMode();
  const rc = getRechartsPalette(isDark);
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke={rc.gridStroke} />
            <XAxis
              dataKey={xKey}
              type="number"
              label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
              stroke={rc.axisLabelFill}
              tick={{ fill: rc.tickFill }}
            />
            <YAxis
              label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
              stroke={rc.axisLabelFill}
              tick={{ fill: rc.tickFill }}
            />
            <Tooltip contentStyle={rc.tooltipStyle} />
            <Legend />
            {datasets.map((dataset, idx) => (
              <Line
                key={dataset.name}
                data={dataset.data}
                type="monotone"
                dataKey="y"
                name={dataset.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[idx % colors.length], r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
