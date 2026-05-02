import React from 'react';
import MathResultBox from './MathResultBox.jsx';

/**
 * Renders a matrix in LaTeX format with proper brackets.
 * 
 * @param {Array<Array<number>>} matrix - 2D array representing the matrix
 * @param {string} title - Optional title for the matrix
 * @param {string} label - Optional label (e.g., "A", "B", "Result")
 */
export function MatrixRenderer({ matrix, title = 'Matrix', label = null }) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
    return <p className="text-sm text-slate-500">No matrix data</p>;
  }

  // Convert matrix to LaTeX format
  const latexMatrix = matrix
    .map((row) => row.join(' & '))
    .join(' \\\\ ');

  const latexContent = label
    ? `$$${label} = \\begin{bmatrix} ${latexMatrix} \\end{bmatrix}$$`
    : `$$\\begin{bmatrix} ${latexMatrix} \\end{bmatrix}$$`;

  return <MathResultBox title={title} content={latexContent} />;
}

/**
 * Renders a vector in LaTeX format.
 * 
 * @param {Array<number>} vector - 1D array representing the vector
 * @param {string} title - Optional title
 * @param {string} label - Optional label (e.g., "v", "u")
 */
export function VectorRenderer({ vector, title = 'Vector', label = null }) {
  if (!vector || !Array.isArray(vector) || vector.length === 0) {
    return <p className="text-sm text-slate-500">No vector data</p>;
  }

  const latexVector = vector.join(' \\\\ ');
  const latexContent = label
    ? `$$${label} = \\begin{bmatrix} ${latexVector} \\end{bmatrix}$$`
    : `$$\\begin{bmatrix} ${latexVector} \\end{bmatrix}$$`;

  return <MathResultBox title={title} content={latexContent} />;
}

/**
 * Renders a scalar result (determinant, eigenvalue, etc.).
 * 
 * @param {number} value - The scalar value
 * @param {string} title - Title for the result
 * @param {string} label - Optional label (e.g., "det(A)", "λ")
 */
export function ScalarRenderer({ value, title = 'Result', label = null }) {
  if (value === null || value === undefined) {
    return <p className="text-sm text-slate-500">No result</p>;
  }

  const latexContent = label
    ? `$$${label} = ${value}$$`
    : `$$${value}$$`;

  return <MathResultBox title={title} content={latexContent} />;
}

/**
 * Renders eigenvalues and eigenvectors.
 */
export function EigenRenderer({ eigenvalues, eigenvectors }) {
  if (!eigenvalues || eigenvalues.length === 0) {
    return <p className="text-sm text-slate-500">No eigenvalue data</p>;
  }

  return (
    <div className="space-y-4">
      {/* Eigenvalues */}
      <MathResultBox
        title="Eigenvalues"
        content={`$$\\lambda = \\{${eigenvalues.join(', ')}\\}$$`}
      />

      {/* Eigenvectors */}
      {eigenvectors && eigenvectors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Eigenvectors</h4>
          <div className="space-y-3">
            {eigenvectors.map((vec, i) => (
              <VectorRenderer
                key={i}
                vector={vec}
                title={`Eigenvector ${i + 1}`}
                label={`v_${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Renders a system of linear equations.
 */
export function LinearSystemRenderer({ coefficients, constants, solution }) {
  if (!coefficients || !constants) {
    return <p className="text-sm text-slate-500">No system data</p>;
  }

  // Build LaTeX for the system
  const equations = coefficients.map((row, i) => {
    const terms = row.map((coef, j) => {
      const variable = String.fromCharCode(120 + j); // x, y, z, ...
      if (j === 0) return `${coef}${variable}`;
      return coef >= 0 ? `+ ${coef}${variable}` : `${coef}${variable}`;
    }).join(' ');
    return `${terms} &= ${constants[i]}`;
  }).join(' \\\\ ');

  const systemLatex = `$$\\begin{cases} ${equations} \\end{cases}$$`;

  return (
    <div className="space-y-4">
      <MathResultBox title="System of Equations" content={systemLatex} />
      {solution && (
        <VectorRenderer
          vector={solution}
          title="Solution"
          label="\\vec{x}"
        />
      )}
    </div>
  );
}

/**
 * Generic result renderer that auto-detects type.
 */
export function LinearAlgebraResultRenderer({ result, operation }) {
  if (result === null || result === undefined) return null;

  // Handle error responses
  if (result?.error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Calculation Error</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{result.error}</p>
      </div>
    );
  }

  if (result?.message && !result?.matrix) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Calculation Error</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{result.message}</p>
      </div>
    );
  }

  // Matrix result
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return <MatrixRenderer matrix={result} title="Result" />;
  }

  // Vector result
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return <VectorRenderer vector={result} title="Result" />;
  }

  // Scalar result
  if (typeof result === 'number') {
    const labels = {
      determinant: 'det(A)',
      rank: 'rank(A)',
      trace: 'tr(A)',
    };
    return <ScalarRenderer value={result} title="Result" label={labels[operation]} />;
  }

  // Boolean result (e.g. orthogonality check)
  if (typeof result === 'boolean') {
    return (
      <MathResultBox
        title="Result"
        content={result ? '$$\\text{True}$$' : '$$\\text{False}$$'}
      />
    );
  }

  // Object with specific structure
  if (result && typeof result === 'object') {
    // Eigenvalues from math-engine: { type, values }
    if (result?.type && Array.isArray(result?.values)) {
      if (result.type === 'real') {
        return <EigenRenderer eigenvalues={result.values} />;
      }
      if (result.type === 'complex') {
        const fmt = (z) => {
          const re = z?.re ?? 0;
          const im = z?.im ?? 0;
          if (im === 0) return `${re}`;
          const sign = im >= 0 ? '+' : '-';
          const absIm = Math.abs(im);
          return `${re} ${sign} ${absIm}i`;
        };
        const parts = result.values.map((z, i) => `\\lambda_${i + 1}=${fmt(z)}`).join(',\\;');
        return <MathResultBox title="Eigenvalues" content={`$$${parts}$$`} />;
      }
    }

    // Orthogonality structure: { value: boolean, dotProduct: number }
    if (result?.dotProduct !== undefined && typeof result?.value === 'boolean') {
      return (
        <div className="space-y-3">
          <MathResultBox title="Orthogonal?" content={result.value ? '$$\\text{True}$$' : '$$\\text{False}$$'} />
          <ScalarRenderer value={result.dotProduct} title="Dot product" label="\\mathbf{v}\\cdot\\mathbf{u}" />
        </div>
      );
    }

    // Eigenvalues/eigenvectors
    if (result?.eigenvalues) {
      return <EigenRenderer eigenvalues={result.eigenvalues} eigenvectors={result.eigenvectors} />;
    }

    // Linear system
    if (result?.solution) {
      return <LinearSystemRenderer
        coefficients={result.coefficients}
        constants={result.constants}
        solution={result.solution}
      />;
    }

    // Matrix result in object
    if (result?.matrix) {
      return <MatrixRenderer matrix={result.matrix} title="Result" />;
    }

    // Determinant in object
    if (result?.determinant !== undefined) {
      return <ScalarRenderer value={result.determinant} title="Determinant" label="det(A)" />;
    }

    // Rank in object
    if (result?.rank !== undefined) {
      return <ScalarRenderer value={result.rank} title="Rank" label="rank(A)" />;
    }
  }

  // Fallback: JSON
  return <MathResultBox content={JSON.stringify(result, null, 2)} />;
}
