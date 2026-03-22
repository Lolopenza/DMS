from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class GraphEdge(BaseModel):
    u: str
    v: str
    weight: Optional[float] = None


class GraphData(BaseModel):
    vertices: List[str] = []
    edges: List[Dict[str, Any]] = []
    directed: bool = False
    weighted: bool = False


class GraphTheoryRequest(BaseModel):
    operation: str
    graph: GraphData
    start_node: Optional[str] = None
    end_node: Optional[str] = None

    model_config = {
        'json_schema_extra': {
            'examples': [
                {
                    'operation': 'bfs',
                    'start_node': 'A',
                    'graph': {
                        'vertices': ['A', 'B', 'C', 'D'],
                        'edges': [
                            {'u': 'A', 'v': 'B'},
                            {'u': 'A', 'v': 'C'},
                            {'u': 'B', 'v': 'D'},
                        ],
                        'directed': False,
                    },
                },
                {
                    'operation': 'dijkstra',
                    'start_node': 'A',
                    'graph': {
                        'vertices': ['A', 'B', 'C'],
                        'edges': [
                            {'u': 'A', 'v': 'B', 'weight': 1},
                            {'u': 'B', 'v': 'C', 'weight': 2},
                            {'u': 'A', 'v': 'C', 'weight': 4},
                        ],
                        'directed': True,
                    },
                },
            ]
        }
    }


class MatrixRequest(BaseModel):
    matrix: List[List[float]]
    directed: Optional[bool] = False
    weighted: Optional[bool] = False


class MatrixPowerRequest(BaseModel):
    matrix: List[List[float]]
    power: int


class MatrixNodeRequest(BaseModel):
    matrix: List[List[float]]
    node: int
    directed: Optional[bool] = False


class GraphInfoRequest(BaseModel):
    graph: Dict[str, Any]
