window.Examples = {
  set_theory: {
    union: { label: 'Union', data: { setA: '1, 2, 3', setB: '3, 4, 5' } },
    intersection: { label: 'Intersection', data: { setA: '1, 2, 3', setB: '2, 3, 4' } },
    difference: { label: 'Difference', data: { setA: '1, 2, 3, 4', setB: '3, 4, 5' } },
    symmetric: { label: 'Symmetric Diff', data: { setA: '1, 2, 3', setB: '3, 4, 5' } },
    power: { label: 'Power Set', data: { setA: 'a, b' } },
    complement: { label: 'Complement', data: { setA: '1, 2, 3', universe: '1, 2, 3, 4, 5' } },
    cartesian: { label: 'Cartesian Product', data: { setA: '1, 2', setB: 'a, b' } },
    empty: { label: 'Empty', data: { setC: '' } },
    finite: { label: 'Finite', data: { setC: '1, 2, 3, 4' } },
    infinite: { label: 'Infinite', data: { setC: '1, 2, 3, ...' } },
    cardinality: { label: 'Cardinality', data: { setC: '1, 2, 3, 4, 5' } },
    subset: { label: 'Subset', data: { setD: '1, 2', setE: '1, 2, 3, 4' } },
    superset: { label: 'Superset', data: { setD: '1, 2, 3, 4', setE: '1, 2' } },
    disjoint: { label: 'Disjoint', data: { setD: '1, 2', setE: '3, 4' } },
    equal: { label: 'Equal', data: { setD: '1, 2, 3', setE: '3, 2, 1' } }
  },
  // TODO: Add probability, logic, automata, graph_theory, combinatorics, number_theory
};