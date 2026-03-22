import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcEigenvalues } from '../../api/eigenvalues.js';

export default function Eigenvalues() {
  return (
    <LinearAlgebraModuleShell
      title="Eigenvalues"
      subtitle="Eigenvalues and eigenvectors basics"
      intro="Analyze characteristic behavior of matrices through eigenvalues and corresponding eigenvectors."
      operationOptions={[{ value: 'eigenvalues', label: 'Eigenvalues (2x2)' }]}
      defaultOperation="eigenvalues"
      fields={[
        {
          key: 'matrix',
          label: 'Matrix',
          type: 'matrix',
          defaultValue: '3,1;0,2',
          help: '2x2 matrix is supported in this wave',
        },
      ]}
      calculate={calcEigenvalues}
    />
  );
}
