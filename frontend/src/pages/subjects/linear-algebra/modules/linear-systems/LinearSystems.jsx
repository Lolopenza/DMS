import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcLinearSystems } from '../../api/linear-systems.js';

export default function LinearSystems() {
  return (
    <LinearAlgebraModuleShell
      title="Linear Systems"
      subtitle="Solve systems of linear equations"
      intro="Set up augmented matrices and examine solution types for linear equation systems."
      operationOptions={[
        { value: 'gaussian-elimination', label: 'Gaussian Elimination (2x2)' },
        { value: 'solve', label: 'Solve (2x2)' },
      ]}
      defaultOperation="gaussian-elimination"
      fields={[
        {
          key: 'a',
          label: 'Coefficient Matrix A',
          type: 'matrix',
          defaultValue: '2,1;1,-1',
          help: '2x2 matrix for this wave',
        },
        {
          key: 'b',
          label: 'Vector b',
          type: 'vector',
          defaultValue: '5,1',
          help: 'Right-hand side vector',
        },
      ]}
      calculate={calcLinearSystems}
    />
  );
}
