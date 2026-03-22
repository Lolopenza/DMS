import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcSearching } from '../../api/searching';

const Searching = () => {
  return (
    <AlgorithmsModuleShell
      title="Searching Algorithms"
      subtitle="Linear and Binary Search"
      intro="Implement and analyze linear and binary search algorithms with performance metrics."
      operationOptions={[
        { value: 'linear-search', label: 'Linear Search' },
        { value: 'binary-search', label: 'Binary Search' },
      ]}
      defaultOperation="linear-search"
      fields={[
        { key: 'array', label: 'Array (comma-separated)', type: 'text', defaultValue: '10,20,30,40,50', hint: 'e.g., 1,3,5,7,9' },
        { key: 'target', label: 'Target Value', type: 'text', defaultValue: '30' },
      ]}
      calculate={calcSearching}
    />
  );
};

export default Searching;
