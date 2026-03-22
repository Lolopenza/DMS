from pydantic import BaseModel


class LinearAlgebraRequest(BaseModel):
    module: str
    operation: str

    model_config = {
        'extra': 'allow',
        'json_schema_extra': {
            'examples': [
                {'module': 'vectors', 'operation': 'dot-product', 'a': [1, 2, 3], 'b': [3, 2, 1]},
                {'module': 'matrices', 'operation': 'multiply', 'a': [[1, 2], [3, 4]], 'b': [[2, 0], [1, 2]]},
            ]
        },
    }
