"""
Discrete Math namespace package.

This package provides a clear umbrella for all discrete-math related domains
with a single cohesive entrypoint for discrete domains.
"""

from core.discrete_math import algebraic_structures
from core.discrete_math import automata
from core.discrete_math import combinatorics
from core.discrete_math import discrete_probability
from core.discrete_math import functions_relations
from core.discrete_math import graph_theory
from core.discrete_math import logic
from core.discrete_math import number_theory
from core.discrete_math import set_theory
from core.discrete_math import visualization

# Cross-subject computational areas used by the platform.
from core import algorithms
from core import linear_algebra

__all__ = [
    'algebraic_structures',
    'automata',
    'combinatorics',
    'discrete_probability',
    'functions_relations',
    'graph_theory',
    'logic',
    'number_theory',
    'set_theory',
    'visualization',
    'algorithms',
    'linear_algebra',
]
