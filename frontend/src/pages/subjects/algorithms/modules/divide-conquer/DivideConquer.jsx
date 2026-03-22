import React from 'react';
import AlgorithmsModuleShell from '../../_shared/AlgorithmsModuleShell';
import { calcDivideConquer } from '../../api/divide-conquer';

const DivideConquer = () => {
  return (
    <AlgorithmsModuleShell
      title="Divide and Conquer"
      subtitle="Binary Exponentiation"
      intro="Solve problems by dividing into subproblems, solving independently, then combining."
      operationOptions={[
        { value: 'binary-power', label: 'Binary Exponentiation' },
      ]}
      defaultOperation="binary-power"
      fields={[
        { key: 'base', label: 'Base', type: 'text', defaultValue: '2' },
        { key: 'exponent', label: 'Exponent', type: 'text', defaultValue: '8' },
      ]}
      calculate={calcDivideConquer}
    />
  );
};

export default DivideConquer;
