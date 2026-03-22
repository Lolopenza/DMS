import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcVectors } from '../../api/vectors.js';

export default function Vectors() {
  return (
    <LinearAlgebraModuleShell
      title="Vectors"
      subtitle="Vector arithmetic and geometric operations"
      intro="Work with vector addition, scalar multiplication, dot product, and geometric interpretation."
      operationOptions={[
        { value: 'dot-product', label: 'Dot Product' },
        { value: 'add', label: 'Addition' },
        { value: 'subtract', label: 'Subtraction' },
        { value: 'magnitude', label: 'Magnitude' },
      ]}
      defaultOperation="dot-product"
      fields={[
        { key: 'a', label: 'Vector A', type: 'vector', defaultValue: '1,2,3', help: 'Comma-separated numbers' },
        {
          key: 'b',
          label: 'Vector B',
          type: 'vector',
          defaultValue: '3,2,1',
          showWhen: ['dot-product', 'add', 'subtract'],
          help: 'Required for binary vector operations',
        },
      ]}
      calculate={calcVectors}
    />
  );
}
