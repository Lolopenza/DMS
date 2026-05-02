import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import AnimatedResult, { HighlightResult } from './AnimatedResult.jsx';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

/**
 * Distribution and probability chart viewer.
 * Supports bar, line, and pie charts for probability distributions.
 *
 * @param {'bar'|'line'|'pie'} chartType
 * @param {Array<{name: string, value: number}>} data
 * @param {string} title
 * @param {string} xLabel
 * @param {string} yLabel
 * @param {number} probability - Main probability result (0-1)
 */
export default function DistributionChart({
  chartType = 'bar',
  data = [],
  title = 'Distribution',
  xLabel = 'Value',
  yLabel = 'Probability',
  probability = null,
}) {
  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      {probability !== null && (
        <HighlightResult>
          <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Probability
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
                {(probability * 100).toFixed(2)}%
              </span>
              <span className="text-lg text-slate-500 dark:text-slate-400">
                ({probability.toFixed(6)})
              </span>
            </div>
            <ProbabilityBar probability={probability} />
          </div>
        </HighlightResult>
      )}

      {data.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex items-center gap-2">
            {chartType === 'pie' ? (
              <PieChartIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>

          <div className="h-64">
            {chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    label={{
                      value: xLabel,
                      position: 'bottom',
                      fontSize: 12,
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 12,
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value) => [
                      typeof value === 'number' ? value.toFixed(4) : value,
                      yLabel,
                    ]}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    label={{
                      value: xLabel,
                      position: 'bottom',
                      fontSize: 12,
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 12,
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {chartType === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value) => [
                      typeof value === 'number' ? value.toFixed(4) : value,
                      'Probability',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </AnimatedResult>
  );
}

function ProbabilityBar({ probability }) {
  const percentage = Math.min(Math.max(probability * 100, 0), 100);

  return (
    <div className="mt-3">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/**
 * Simple probability result display (no chart).
 */
export function ProbabilityResult({ favorable, total, probability }) {
  return (
    <AnimatedResult variant="slideUp" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Favorable
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {favorable}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">
              {total}
            </p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Probability
            </p>
            <p className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {favorable}/{total}
            </p>
          </div>
        </div>
      </div>

      <HighlightResult>
        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Result
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
              {(probability * 100).toFixed(2)}%
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400">
              = {probability.toFixed(6)}
            </span>
          </div>
          <ProbabilityBar probability={probability} />
        </div>
      </HighlightResult>
    </AnimatedResult>
  );
}
