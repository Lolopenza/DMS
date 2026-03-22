import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcOrthogonality } from '../../api/orthogonality.js';

export default function Orthogonality() {
  return (
    <LinearAlgebraModuleShell
      title="Orthogonality"
      subtitle="Inner products, projections, orthonormality"
      intro="Explore orthogonality, projections, and Gram-Schmidt style normalization workflows."
      operationOptions={[
        { value: 'projection', label: 'Projection' },
        { value: 'dot-product', label: 'Dot Product' },
        { value: 'is-orthogonal', label: 'Orthogonality Check' },
      ]}
      defaultOperation="projection"
      fields={[
        {
          key: 'vector',
          label: 'Vector',
          type: 'vector',
          defaultValue: '3,4',
          help: 'Primary vector',
        },
        {
          key: 'onto',
          label: 'Onto Vector',
          type: 'vector',
          defaultValue: '1,0',
          help: 'Reference vector',
        },
      ]}
      calculate={calcOrthogonality}
    />
  );
}
