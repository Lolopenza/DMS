import React from 'react';
import LinearAlgebraModuleShell from '../../_shared/LinearAlgebraModuleShell.jsx';
import { calcLinearTransformations } from '../../api/linear-transformations.js';

export default function LinearTransformations() {
  return (
    <LinearAlgebraModuleShell
      title="Linear Transformations"
      subtitle="Mappings, kernels, and image spaces"
      intro="Inspect linear mappings with matrix representations, kernel checks, and image interpretation."
      operationOptions={[{ value: 'apply-transformation', label: 'Apply Transformation' }]}
      defaultOperation="apply-transformation"
      fields={[
        {
          key: 'matrix',
          label: 'Transformation Matrix',
          type: 'matrix',
          defaultValue: '1,0;0,-1',
          help: 'Rows separated by semicolon',
        },
        {
          key: 'vector',
          label: 'Input Vector',
          type: 'vector',
          defaultValue: '2,3',
          help: 'Comma-separated numeric vector',
        },
      ]}
      calculate={calcLinearTransformations}
    />
  );
}
