import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcSorting } from '../../api/sorting';

const Sorting = () => {
  return (
    <AlgorithmsModuleShell
      title="Sorting Algorithms"
      subtitle="Bubble, Merge, Quick Sort"
      intro="Compare and visualize different sorting algorithms with analysis of comparisons and swaps."
      operationOptions={[
        { value: 'bubble-sort', label: 'Bubble Sort' },
        { value: 'merge-sort', label: 'Merge Sort' },
        { value: 'quick-sort', label: 'Quick Sort' },
      ]}
      defaultOperation="bubble-sort"
      fields={[
        { key: 'array', label: 'Array (comma-separated)', type: 'text', defaultValue: '64,34,25,12,22', hint: 'e.g., 5,2,8,1,9' },
      ]}
      calculate={calcSorting}
    />
  );
};

export default Sorting;
