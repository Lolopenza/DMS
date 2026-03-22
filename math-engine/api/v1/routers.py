from api.v1 import (
    adjacency_matrix,
    algorithms,
    automata,
    chat,
    combinatorics,
    graph_theory,
    linear_algebra,
    logic,
    number_theory,
    ocr,
    probability,
    set_theory,
)

ROUTERS = [
    combinatorics.router,
    logic.router,
    set_theory.router,
    automata.router,
    graph_theory.router,
    adjacency_matrix.router,
    probability.router,
    number_theory.router,
    linear_algebra.router,
    algorithms.router,
    chat.router,
    ocr.router,
]

FEATURE_NAMES = [
    'Graph Theory',
    'Combinatorics',
    'Probability',
    'Automata',
    'Set Theory',
    'Number Theory',
    'Linear Algebra',
    'Algorithms',
    'Logic',
    'AI Chat',
]
