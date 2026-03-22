from typing import Set, Any, TypeVar, Tuple, Iterable
from itertools import chain, combinations, product

T = TypeVar('T')

def set_union(set_a: Set[T], set_b: Set[T]) -> Set[T]:
    return set_a.union(set_b)

def set_intersection(set_a: Set[T], set_b: Set[T]) -> Set[T]:
    return set_a.intersection(set_b)

def set_difference(set_a: Set[T], set_b: Set[T]) -> Set[T]:
    return set_a.difference(set_b)

def set_symmetric_difference(set_a: Set[T], set_b: Set[T]) -> Set[T]:
    return set_a.symmetric_difference(set_b)

def set_complement(universe: Set[T], set_a: Set[T]) -> Set[T]:
    if not set_a.issubset(universe):
        raise ValueError("Set A must be a subset of the universe to compute its complement.")
    return universe.difference(set_a)

def is_subset(set_a: Set[T], set_b: Set[T]) -> bool:
    return set_a.issubset(set_b)

def is_proper_subset(set_a: Set[T], set_b: Set[T]) -> bool:
    return set_a.issubset(set_b) and set_a != set_b

def are_sets_equal(set_a: Set[T], set_b: Set[T]) -> bool:
    return set_a == set_b

def get_power_set(input_set: Set[Any]) -> Set[Tuple[Any, ...]]:
    s = list(input_set)
    power_set_tuples = chain.from_iterable(combinations(s, r) for r in range(len(s) + 1))
    return set(frozenset(subset) for subset in power_set_tuples)

def cartesian_product(set1: Iterable[Any], set2: Iterable[Any]) -> Set[Tuple[Any, Any]]:
    list1 = list(set1)
    list2 = list(set2)
    return set(product(list1, list2))

