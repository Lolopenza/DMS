/**
 * Recharts does not read Tailwind — pass these stroke/fill/tooltip values from useIsDarkMode().
 */

export function getRechartsPalette(isDark) {
  if (isDark) {
    return {
      gridStroke: '#334155',
      tickFill: '#cbd5e1',
      axisLabelFill: '#94a3b8',
      tooltipStyle: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f1f5f9',
      },
    };
  }
  return {
    gridStroke: '#e2e8f0',
    tickFill: '#64748b',
    axisLabelFill: '#64748b',
    tooltipStyle: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      color: '#0f172a',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
    },
  };
}
