import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell.jsx';
import { calcAlgorithms } from '../../../../../api.js';

/**
 * Sorting Algorithms module - migrated to premium AlgorithmsModuleShell.
 * Before: Used old ModuleCard/ModulePage.
 * After: Uses CalculatorCard + useCalculator + StepByStepRenderer + ComplexityBadge.
 */
export default function Sorting() {
  return (
    <AlgorithmsModuleShell
      title="Sorting Algorithms"
      subtitle="Visualize and compare sorting algorithms with step-by-step execution"
      description="Explore classic sorting algorithms with detailed step-by-step visualization. Watch how each algorithm compares and swaps elements, and analyze their time and space complexity. Perfect for understanding algorithm efficiency and trade-offs."
      module="sorting"
      operationOptions={[
        { 
          value: 'bubble-sort', 
          label: 'Bubble Sort', 
          hint: 'Simple comparison-based sort. Repeatedly swaps adjacent elements if they are in wrong order. O(n²) time complexity.' 
        },
        { 
          value: 'merge-sort', 
          label: 'Merge Sort', 
          hint: 'Divide-and-conquer algorithm. Divides array into halves, sorts them, and merges. O(n log n) time, O(n) space.' 
        },
        { 
          value: 'quick-sort', 
          label: 'Quick Sort', 
          hint: 'Efficient divide-and-conquer sort. Picks a pivot and partitions array around it. Average O(n log n), worst O(n²).' 
        },
      ]}
      defaultOperation="bubble-sort"
      fields={[
        {
          key: 'array',
          label: 'Array to Sort',
          type: 'number-array',
          required: true,
          defaultValue: '64,34,25,12,22,11,90',
          hint: 'Comma-separated numbers, or use Add below.',
        },
      ]}
      calculate={calcAlgorithms}
    />
  );
}
