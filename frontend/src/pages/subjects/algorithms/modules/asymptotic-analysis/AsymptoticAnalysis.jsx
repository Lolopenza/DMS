import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcAsymptoticAnalysis } from '../../api/asymptotic-analysis';

const AsymptoticAnalysis = () => {
  return (
    <AlgorithmsModuleShell
      title="Asymptotic Analysis"
      subtitle="Big O Notation and Complexity Classes"
      intro="Analyze time complexity and compare asymptotic growth rates of different complexity classes."
      operationOptions={[
        { value: 'time-complexity', label: 'Time Complexity' },
        { value: 'compare-complexities', label: 'Compare Complexities' },
      ]}
      defaultOperation="time-complexity"
      fields={[
        {
          key: 'complexity',
          label: 'Complexity Class',
          type: 'select',
          defaultValue: 'linear',
          options: [
            { value: 'constant', label: 'constant - O(1)' },
            { value: 'logarithmic', label: 'logarithmic - O(log n)' },
            { value: 'linear', label: 'linear - O(n)' },
            { value: 'linearithmic', label: 'linearithmic - O(n log n)' },
            { value: 'quadratic', label: 'quadratic - O(n^2)' },
            { value: 'cubic', label: 'cubic - O(n^3)' },
            { value: 'exponential', label: 'exponential - O(2^n)' },
          ],
        },
        { key: 'n', label: 'Input Size (n)', type: 'number', defaultValue: '100', showWhen: ['time-complexity'] },
      ]}
      calculate={calcAsymptoticAnalysis}
    />
  );
};

export default AsymptoticAnalysis;
