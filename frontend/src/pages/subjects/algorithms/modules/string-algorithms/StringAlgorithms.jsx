import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcStringAlgorithms } from '../../api/string-algorithms';

const StringAlgorithms = () => {
  return (
    <AlgorithmsModuleShell
      title="String Algorithms"
      subtitle="Pattern Matching"
      intro="Implement efficient algorithms for searching patterns in text."
      operationOptions={[
        { value: 'brute-force', label: 'Brute Force Search' },
        { value: 'kmp-search', label: 'KMP Search' },
      ]}
      defaultOperation="brute-force"
      fields={[
        { key: 'text', label: 'Text', type: 'text', defaultValue: 'ABABDABACDABABCABAB' },
        { key: 'pattern', label: 'Pattern', type: 'text', defaultValue: 'ABABCABAB' },
      ]}
      calculate={calcStringAlgorithms}
    />
  );
};

export default StringAlgorithms;
