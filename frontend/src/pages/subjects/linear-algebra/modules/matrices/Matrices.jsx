import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcMatrices } from '../../api/matrices.js';

export default function Matrices() {
  return (
    <LinearAlgebraModuleShell
      title="Matrices"
      subtitle="Matrix operations, rank, and inverse"
      intro="Explore matrix multiplication, transposition, inverse checks, and rank-oriented workflows."
      operationOptions={[
        { value: 'multiply', label: 'Multiply A x B' },
        { value: 'add', label: 'Add A + B' },
        { value: 'transpose', label: 'Transpose A' },
        { value: 'determinant', label: 'Determinant of A' },
        { value: 'inverse', label: 'Inverse of A (2x2)' },
      ]}
      defaultOperation="multiply"
      fields={[
        {
          key: 'a',
          label: 'Matrix A',
          type: 'matrix',
          defaultValue: '1,2;3,4',
          help: 'Use rows separated by semicolon, columns by comma',
        },
        {
          key: 'b',
          label: 'Matrix B',
          type: 'matrix',
          defaultValue: '2,0;1,2',
          showWhen: ['multiply', 'add'],
          help: 'Required for multiplication and addition',
        },
      ]}
      calculate={calcMatrices}
    />
  );
}
