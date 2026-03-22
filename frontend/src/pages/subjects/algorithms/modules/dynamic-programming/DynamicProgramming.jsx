import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcDynamicProgramming } from '../../api/dynamic-programming';

const DynamicProgramming = () => {
  return (
    <AlgorithmsModuleShell
      title="Dynamic Programming"
      subtitle="Fibonacci and Coin Change"
      intro="Solve optimization problems using dynamic programming with memoization."
      operationOptions={[
        { value: 'fibonacci', label: 'Fibonacci Sequence' },
        { value: 'coin-change', label: 'Coin Change' },
      ]}
      defaultOperation="fibonacci"
      fields={[
        { key: 'n', label: 'Input (n)', type: 'text', defaultValue: '10' },
        { key: 'steps', label: 'Coin Denominations', type: 'text', defaultValue: '1,5,10', showWhen: ['coin-change'], hint: 'e.g., 1,5,10' },
      ]}
      calculate={calcDynamicProgramming}
    />
  );
};

export default DynamicProgramming;
