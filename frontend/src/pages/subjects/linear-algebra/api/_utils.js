function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function toNumberArray(values, name = 'vector') {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${name} must be a non-empty array`);
  }
  const parsed = values.map((v) => Number(v));
  if (!parsed.every(isFiniteNumber)) {
    throw new Error(`${name} contains invalid numeric values`);
  }
  return parsed;
}

export function assertSameLength(a, b, nameA = 'a', nameB = 'b') {
  if (a.length !== b.length) {
    throw new Error(`${nameA} and ${nameB} must have the same length`);
  }
}

export function dot(a, b) {
  assertSameLength(a, b, 'vector a', 'vector b');
  return a.reduce((acc, value, idx) => acc + value * b[idx], 0);
}

export function magnitude(a) {
  return Math.sqrt(dot(a, a));
}

export function validateMatrix(matrix, name = 'matrix') {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error(`${name} must be a 2D array`);
  }
  const cols = matrix[0].length;
  if (cols === 0) {
    throw new Error(`${name} must have at least one column`);
  }
  const parsed = matrix.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error(`${name} row ${rowIndex + 1} has inconsistent length`);
    }
    return row.map((v) => Number(v));
  });
  if (!parsed.flat().every(isFiniteNumber)) {
    throw new Error(`${name} contains invalid numeric values`);
  }
  return parsed;
}

export function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

export function addMatrices(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for addition');
  }
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function multiplyMatrices(a, b) {
  if (a[0].length !== b.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication');
  }
  return a.map((row) =>
    b[0].map((_, col) => row.reduce((sum, value, idx) => sum + value * b[idx][col], 0))
  );
}

export function determinant2x2(matrix) {
  if (matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error('determinant2x2 expects a 2x2 matrix');
  }
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

export function determinant3x3(matrix) {
  if (matrix.length !== 3 || matrix[0].length !== 3) {
    throw new Error('determinant3x3 expects a 3x3 matrix');
  }
  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function inverse2x2(matrix) {
  const det = determinant2x2(matrix);
  if (Math.abs(det) < 1e-12) {
    throw new Error('Matrix is singular and cannot be inverted');
  }
  return [
    [matrix[1][1] / det, -matrix[0][1] / det],
    [-matrix[1][0] / det, matrix[0][0] / det],
  ];
}

export function solve2x2(a, b) {
  if (a.length !== 2 || a[0].length !== 2) {
    throw new Error('Only 2x2 systems are supported in this wave');
  }
  const vectorB = toNumberArray(b, 'vector b');
  if (vectorB.length !== 2) {
    throw new Error('vector b must contain exactly 2 values for a 2x2 system');
  }
  const det = determinant2x2(a);
  if (Math.abs(det) < 1e-12) {
    throw new Error('System has no unique solution (determinant is zero)');
  }
  const x = (vectorB[0] * a[1][1] - a[0][1] * vectorB[1]) / det;
  const y = (a[0][0] * vectorB[1] - vectorB[0] * a[1][0]) / det;
  return [x, y];
}

export function eigenvalues2x2(matrix) {
  if (matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error('Only 2x2 eigenvalue computation is supported in this wave');
  }
  const trace = matrix[0][0] + matrix[1][1];
  const det = determinant2x2(matrix);
  const discriminant = trace * trace - 4 * det;
  if (discriminant < 0) {
    return {
      type: 'complex',
      trace,
      determinant: det,
      realPart: trace / 2,
      imaginaryPart: Math.sqrt(Math.abs(discriminant)) / 2,
    };
  }
  const sqrtD = Math.sqrt(discriminant);
  return {
    type: 'real',
    trace,
    determinant: det,
    values: [(trace + sqrtD) / 2, (trace - sqrtD) / 2],
  };
}

export function projection(vector, onto) {
  const denom = dot(onto, onto);
  if (Math.abs(denom) < 1e-12) {
    throw new Error('Cannot project onto a zero vector');
  }
  const factor = dot(vector, onto) / denom;
  return {
    factor,
    vector: onto.map((v) => factor * v),
  };
}

export function rank(matrix) {
  const m = matrix.map((row) => [...row]);
  const rows = m.length;
  const cols = m[0].length;
  let r = 0;

  for (let c = 0; c < cols && r < rows; c += 1) {
    let pivot = r;
    for (let i = r + 1; i < rows; i += 1) {
      if (Math.abs(m[i][c]) > Math.abs(m[pivot][c])) pivot = i;
    }
    if (Math.abs(m[pivot][c]) < 1e-12) continue;

    [m[r], m[pivot]] = [m[pivot], m[r]];
    const pivotValue = m[r][c];
    for (let j = c; j < cols; j += 1) {
      m[r][j] /= pivotValue;
    }
    for (let i = 0; i < rows; i += 1) {
      if (i === r) continue;
      const factor = m[i][c];
      for (let j = c; j < cols; j += 1) {
        m[i][j] -= factor * m[r][j];
      }
    }
    r += 1;
  }

  return r;
}
