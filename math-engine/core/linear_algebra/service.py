from core.linear_algebra import (
    determinants,
    eigenvalues,
    linear_systems,
    linear_transformations,
    matrices,
    orthogonality,
    vector_spaces,
    vectors,
)


def calculate(body: dict, module: str, operation: str):
    if module == 'vectors':
        return vectors.solve(operation, body)
    if module == 'matrices':
        return matrices.solve(operation, body)
    if module == 'linear-systems':
        return linear_systems.solve(operation, body)
    if module == 'determinants':
        return determinants.solve(operation, body)
    if module == 'eigenvalues':
        return eigenvalues.solve(operation, body)
    if module == 'linear-transformations':
        return linear_transformations.solve(operation, body)
    if module == 'vector-spaces':
        return vector_spaces.solve(operation, body)
    if module == 'orthogonality':
        return orthogonality.solve(operation, body)
    raise ValueError(f'Unknown module: {module}')
