import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcGreedy } from '../../api/greedy';

const Greedy = () => {
  return (
    <AlgorithmsModuleShell
      title="Greedy Algorithms"
      subtitle="Fractional Knapsack"
      intro="Solve optimization problems using greedy strategy with locally optimal choices."
      operationOptions={[
        { value: 'fractional-knapsack', label: 'Fractional Knapsack' },
      ]}
      defaultOperation="fractional-knapsack"
      fields={[
        { key: 'capacity', label: 'Knapsack Capacity', type: 'text', defaultValue: '50' },
        { key: 'items', label: 'Items (value:weight)', type: 'textarea', defaultValue: '60:10;100:20;120:30', rows: 3, hint: 'Format: value:weight;value:weight' },
      ]}
      calculate={calcGreedy}
    />
  );
};

export default Greedy;
