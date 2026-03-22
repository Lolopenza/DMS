import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcVectorSpaces } from '../../api/vector-spaces.js';

export default function VectorSpaces() {
  return (
    <LinearAlgebraModuleShell
      title="Vector Spaces"
      subtitle="Subspaces, basis, and dimension"
      intro="Evaluate span, linear independence, basis selection, and dimensions in vector spaces."
      operationOptions={[
        { value: 'basis-check', label: 'Basis Check' },
        { value: 'rank', label: 'Rank' },
      ]}
      defaultOperation="basis-check"
      fields={[
        {
          key: 'vectors',
          label: 'Vectors Matrix',
          type: 'matrix',
          defaultValue: '1,0,0;0,1,0;1,1,0',
          help: 'Each row is one vector',
        },
      ]}
      calculate={calcVectorSpaces}
    />
  );
}
