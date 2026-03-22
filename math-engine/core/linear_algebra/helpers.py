import math

EPS = 1e-10


def as_vector(raw, name: str):
    if not isinstance(raw, list) or not raw:
        raise ValueError(f'{name} must be a non-empty array of numbers')
    out = []
    for item in raw:
        try:
            out.append(float(item))
        except Exception as exc:
            raise ValueError(f'{name} must contain only numeric values') from exc
    return out


def as_matrix(raw, name: str):
    if not isinstance(raw, list) or not raw:
        raise ValueError(f'{name} must be a non-empty matrix')

    out = []
    width = None
    for row in raw:
        if not isinstance(row, list) or not row:
            raise ValueError(f'{name} rows must be non-empty arrays')

        converted = []
        for item in row:
            try:
                converted.append(float(item))
            except Exception as exc:
                raise ValueError(f'{name} must contain only numeric values') from exc

        if width is None:
            width = len(converted)
        elif width != len(converted):
            raise ValueError(f'All rows in {name} must have equal length')

        out.append(converted)

    return out


def dot(a, b):
    if len(a) != len(b):
        raise ValueError('Vectors must have equal dimensions')
    return sum(a[i] * b[i] for i in range(len(a)))


def magnitude(v):
    return math.sqrt(dot(v, v))


def transpose(m):
    return [list(col) for col in zip(*m)]


def mat_add(a, b):
    if len(a) != len(b) or len(a[0]) != len(b[0]):
        raise ValueError('Matrix dimensions must match for addition')
    return [[a[i][j] + b[i][j] for j in range(len(a[0]))] for i in range(len(a))]


def mat_mul(a, b):
    if len(a[0]) != len(b):
        raise ValueError('Incompatible matrix dimensions for multiplication')
    bt = transpose(b)
    return [[sum(row[k] * col[k] for k in range(len(row))) for col in bt] for row in a]


def det2(m):
    return m[0][0] * m[1][1] - m[0][1] * m[1][0]


def det3(m):
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
        - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
        + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    )


def inverse2(m):
    det = det2(m)
    if abs(det) < EPS:
        raise ValueError('Matrix is singular and cannot be inverted')
    return [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]]


def rank(matrix):
    m = [row[:] for row in matrix]
    rows = len(m)
    cols = len(m[0])
    r = 0
    c = 0

    while r < rows and c < cols:
        pivot = max(range(r, rows), key=lambda i: abs(m[i][c]))
        if abs(m[pivot][c]) < EPS:
            c += 1
            continue

        m[r], m[pivot] = m[pivot], m[r]
        pv = m[r][c]
        m[r] = [x / pv for x in m[r]]

        for i in range(rows):
            if i != r and abs(m[i][c]) > EPS:
                factor = m[i][c]
                m[i] = [m[i][j] - factor * m[r][j] for j in range(cols)]

        r += 1
        c += 1

    return r


def solve2x2(a, b):
    det = det2(a)
    if abs(det) < EPS:
        raise ValueError('System has no unique solution (determinant is zero)')
    x = (b[0] * a[1][1] - a[0][1] * b[1]) / det
    y = (a[0][0] * b[1] - b[0] * a[1][0]) / det
    return [x, y]


def eigenvalues2x2(m):
    a, b = m[0]
    c, d = m[1]
    trace = a + d
    det = a * d - b * c
    disc = trace * trace - 4 * det

    if disc >= 0:
        root = math.sqrt(disc)
        return {
            'type': 'real',
            'values': [(trace + root) / 2, (trace - root) / 2],
        }

    imag = math.sqrt(-disc) / 2
    real = trace / 2
    return {
        'type': 'complex',
        'values': [{'re': real, 'im': imag}, {'re': real, 'im': -imag}],
    }
