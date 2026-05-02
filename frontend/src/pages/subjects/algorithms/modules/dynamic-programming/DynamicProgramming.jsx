import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell.jsx';
import { calcDynamicProgramming } from '../../api/dynamic-programming';

const DynamicProgramming = () => {
  return (
    <AlgorithmsModuleShell
      module="dynamic-programming"
      title="Dynamic Programming"
      subtitle="Fibonacci and Coin Change"
      intro="Solve optimization problems using dynamic programming with memoization."
      operationOptions={[
        { value: 'fibonacci', label: 'Fibonacci Sequence' },
        { value: 'coin-change', label: 'Coin Change' },
      ]}
      defaultOperation="fibonacci"
      fields={[
        { key: 'n', label: 'Input (n)', type: 'text', defaultValue: '10', required: true },
        {
          key: 'steps',
          label: 'Coin Denominations',
          type: 'text',
          smartType: 'number-list',
          defaultValue: '1,5,10',
          showWhen: ['coin-change'],
          hint: 'e.g., 1,5,10 — or build with Add below.',
          required: true,
        },
      ]}
      calculate={calcDynamicProgramming}
    />
  );
};

export default DynamicProgramming;
