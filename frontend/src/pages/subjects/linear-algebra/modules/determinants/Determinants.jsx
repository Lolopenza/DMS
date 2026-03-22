import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcDeterminants } from '../../api/determinants.js';

export default function Determinants() {
  return (
    <LinearAlgebraModuleShell
      title="Determinants"
      subtitle="Determinant properties and computation"
      intro="Use determinant rules for invertibility checks, transformation scaling, and equation solving."
      operationOptions={[{ value: 'determinant', label: 'Determinant' }]}
      defaultOperation="determinant"
      fields={[
        {
          key: 'matrix',
          label: 'Matrix',
          type: 'matrix',
          defaultValue: '4,2;1,3',
          help: 'Supports 2x2 and 3x3 in this wave',
        },
      ]}
      calculate={calcDeterminants}
    />
  );
}
