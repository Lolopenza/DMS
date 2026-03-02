from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SetOperationRequest(BaseModel):
    operation: str
    setA: Optional[List[Any]] = None
    setB: Optional[List[Any]] = None
    setC: Optional[List[Any]] = None
    universe: Optional[List[Any]] = None

    model_config = {
        'json_schema_extra': {
            'examples': [
                {'operation': 'union', 'setA': [1, 2, 3], 'setB': [3, 4, 5]},
                {'operation': 'intersection', 'setA': [1, 2, 3], 'setB': [2, 3, 4]},
                {'operation': 'difference', 'setA': [1, 2, 3], 'setB': [2, 3]},
                {'operation': 'power', 'setC': [1, 2, 3]},
                {'operation': 'complement', 'setC': [1, 2], 'universe': [1, 2, 3, 4, 5]},
                {'operation': 'cartesian', 'setA': [1, 2], 'setB': ['a', 'b']},
            ]
        }
    }


class SetTheoryRequest(BaseModel):
    action: Optional[str] = None
    operation: Optional[str] = None
    setA: Optional[Any] = None
    setB: Optional[Any] = None
    universe: Optional[Any] = None
    relation: Optional[List[List[Any]]] = None
    relation2: Optional[List[List[Any]]] = None
    name: Optional[str] = None
    value: Optional[Any] = None
    named_sets: Optional[Dict[str, Any]] = None
    named_universes: Optional[Dict[str, Any]] = None
    operations: Optional[List[Dict[str, Any]]] = None
