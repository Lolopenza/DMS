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

if __name__ == '__main__':
    set1 = {1, 2, 3, 4}
    set2 = {3, 4, 5, 6}
    universe = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    print(f"Set 1: {set1}")
    print(f"Set 2: {set2}")
    print(f"Universe: {universe}")

    print(f"\nUnion: {set_union(set1, set2)}")
    print(f"Intersection: {set_intersection(set1, set2)}")
    print(f"Difference (Set1 - Set2): {set_difference(set1, set2)}")
    print(f"Difference (Set2 - Set1): {set_difference(set2, set1)}")
    print(f"Symmetric Difference: {set_symmetric_difference(set1, set2)}")
    print(f"Complement of Set1: {set_complement(universe, set1)}")
    print(f"Is Set1 subset of Set2? {is_subset(set1, set2)}")
    print(f"Is {1, 2} subset of Set1? {is_subset({1, 2}, set1)}")
    print(f"Is Set1 proper subset of Set2? {is_proper_subset(set1, set2)}")
    print(f"Is {1, 2} proper subset of Set1? {is_proper_subset({1, 2}, set1)}")
    print(f"Are Set1 and Set2 equal? {are_sets_equal(set1, set2)}")
    print(f"Are {1, 2, 3, 4} and Set1 equal? {are_sets_equal({1, 2, 3, 4}, set1)}")

    print(f"\nPower Set of {{'a', 'b'}}:")
    power_set_ab = get_power_set({'a', 'b'})
    print("{ " + ", ".join(str(set(fs)) for fs in power_set_ab) + " }")

    print(f"\nCartesian Product of Set 1 and Set 2: {cartesian_product(set1, set2)}")

    print(f"\nCartesian Product of Set 1 and Set 2: {cartesian_product(set1, set2)}")

