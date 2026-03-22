from pydantic import BaseModel


class AlgorithmsRequest(BaseModel):
    module: str
    operation: str

    model_config = {
        'extra': 'allow',
        'json_schema_extra': {
            'examples': [
                {'module': 'sorting', 'operation': 'quick-sort', 'array': [5, 1, 4, 2, 8]},
                {'module': 'searching', 'operation': 'binary-search', 'array': [1, 3, 5, 7], 'target': 5},
            ]
        },
    }
