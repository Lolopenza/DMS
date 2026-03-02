from itertools import product

def is_relation(relation, domain, codomain=None):
    if codomain is None:
        codomain = domain
        
    if not isinstance(relation, set):
        raise TypeError("Relation must be a set of pairs")
    if not isinstance(domain, set):
        raise TypeError("Domain must be a set")
    if not isinstance(codomain, set):
        raise TypeError("Codomain must be a set")
        
    for pair in relation:
        if not isinstance(pair, tuple) or len(pair) != 2:
            raise ValueError(f"Relation contains non-pair element: {pair}")
        if pair[0] not in domain:
            raise ValueError(f"Element {pair[0]} in relation pair {pair} is not in the domain {domain}")
        if pair[1] not in codomain:
            raise ValueError(f"Element {pair[1]} in relation pair {pair} is not in the codomain {codomain}")
            
    return True

def relation_properties(relation, domain):
    if not is_relation(relation, domain): 
        return None 
        
    props = {
        "reflexive": is_reflexive(relation, domain),
        "symmetric": is_symmetric(relation),
        "transitive": is_transitive(relation),
        "antisymmetric": is_antisymmetric(relation)
    }
    return props

def is_reflexive(relation, domain):
    return all((a, a) in relation for a in domain)

def is_symmetric(relation):
    return all((b, a) in relation for a, b in relation)

def is_transitive(relation):
    for a, b1 in relation:
        for b2, c in relation:
            if b1 == b2: 
                if (a, c) not in relation:
                    return False
    return True

def is_antisymmetric(relation):
    for a, b in relation:
        if a != b and (b, a) in relation:
            return False
    return True

def get_relation_matrix(relation, domain):
    if not is_relation(relation, domain):
        return None
        
    sorted_domain = sorted(list(domain))
    n = len(sorted_domain)
    matrix = [[0] * n for _ in range(n)]
    
    element_to_index = {element: i for i, element in enumerate(sorted_domain)}
    
    for a, b in relation:
        if a in element_to_index and b in element_to_index:
            row_idx = element_to_index[a]
            col_idx = element_to_index[b]
            matrix[row_idx][col_idx] = 1
            
    return matrix, sorted_domain

def closure(relation, domain, closure_type):
    if not is_relation(relation, domain):
        return None
        
    closure_relation = relation.copy()

    if closure_type == 'reflexive':
        for a in domain:
            closure_relation.add((a, a))
            
    elif closure_type == 'symmetric':
        new_pairs = set()
        for a, b in closure_relation:
            if (b, a) not in closure_relation:
                new_pairs.add((b, a))
        closure_relation.update(new_pairs)
        
    elif closure_type == 'transitive':
        while True:
            new_pairs = set()
            for a, b1 in closure_relation:
                for b2, c in closure_relation:
                    if b1 == b2 and (a, c) not in closure_relation:
                        new_pairs.add((a, c))
            
            if not new_pairs: 
                break
            closure_relation.update(new_pairs)
            
    else:
        raise ValueError(f"Unknown closure type: {closure_type}. Choose 'reflexive', 'symmetric', or 'transitive'.")

    return closure_relation

if __name__ == '__main__':
    domain_A = {1, 2, 3}
    relation_R = {(1, 1), (1, 2), (2, 3), (3, 1)}
    relation_S = {(1, 1), (2, 2), (3, 3), (1, 2), (2, 1)}
    relation_T = {(1, 1), (2, 2)} 
    relation_P = {(1, 2), (2, 3), (1, 3)} 
    relation_AS = {(1, 2), (2, 3)} 
    relation_NotAS = {(1, 2), (2, 1)} 

    print(f"Domain A = {domain_A}")
    print(f"Relation R = {relation_R}")
    print(f"Relation S = {relation_S}")

    print(f"\nIs R a relation on A? {is_relation(relation_R, domain_A)}")
    try:
        is_relation({(1, 4)}, domain_A) 
    except ValueError as e:
        print(f"Error check: {e}")
    try:
        is_relation({(1, 2), 3}, domain_A)
    except ValueError as e:
        print(f"Error check: {e}")

    print(f"\nProperties of R: {relation_properties(relation_R, domain_A)}")
    print(f"Properties of S: {relation_properties(relation_S, domain_A)}")
    print(f"Is T reflexive on A? {is_reflexive(relation_T, domain_A)}") 
    print(f"Is P transitive? {is_transitive(relation_P)}") 
    print(f"Is R transitive? {is_transitive(relation_R)}") 
    print(f"Is S symmetric? {is_symmetric(relation_S)}") 
    print(f"Is R symmetric? {is_symmetric(relation_R)}") 
    print(f"Is AS antisymmetric? {is_antisymmetric(relation_AS)}") 
    print(f"Is S antisymmetric? {is_antisymmetric(relation_S)}") 
    print(f"Is NotAS antisymmetric? {is_antisymmetric(relation_NotAS)}") 

    matrix_R, order_R = get_relation_matrix(relation_R, domain_A)
    print(f"\nMatrix for R (order {order_R}):")
    for row in matrix_R:
        print(row)

    print(f"\nReflexive closure of R: {closure(relation_R, domain_A, 'reflexive')}")
    print(f"Symmetric closure of R: {closure(relation_R, domain_A, 'symmetric')}")
    print(f"Transitive closure of R: {closure(relation_R, domain_A, 'transitive')}")

    print(f"Transitive closure of P: {closure(relation_P, domain_A, 'transitive')}")
    # is_relation tests
    print(f"\nIs R a relation on A? {is_relation(relation_R, domain_A)}")
    try:
        is_relation({(1, 4)}, domain_A) 
    except ValueError as e:
        print(f"Error check: {e}")
    try:
        is_relation({(1, 2), 3}, domain_A)
    except ValueError as e:
        print(f"Error check: {e}")

    # Properties tests
    print(f"\nProperties of R: {relation_properties(relation_R, domain_A)}")
    print(f"Properties of S: {relation_properties(relation_S, domain_A)}")
    print(f"Is T reflexive on A? {is_reflexive(relation_T, domain_A)}") # False
    print(f"Is P transitive? {is_transitive(relation_P)}") # True
    print(f"Is R transitive? {is_transitive(relation_R)}") # False (1,2), (2,3) but no (1,3)
    print(f"Is S symmetric? {is_symmetric(relation_S)}") # True
    print(f"Is R symmetric? {is_symmetric(relation_R)}") # False
    print(f"Is AS antisymmetric? {is_antisymmetric(relation_AS)}") # True
    print(f"Is S antisymmetric? {is_antisymmetric(relation_S)}") # False (due to (1,2) and (2,1))
    print(f"Is NotAS antisymmetric? {is_antisymmetric(relation_NotAS)}") # False

    # Matrix test
    matrix_R, order_R = get_relation_matrix(relation_R, domain_A)
    print(f"\nMatrix for R (order {order_R}):")
    for row in matrix_R:
        print(row)
    # Expected for order [1, 2, 3]:
    # [[1, 1, 0],
    #  [0, 0, 1],
    #  [1, 0, 0]]

    # Closure tests
    print(f"\nReflexive closure of R: {closure(relation_R, domain_A, 'reflexive')}")
    print(f"Symmetric closure of R: {closure(relation_R, domain_A, 'symmetric')}")
    print(f"Transitive closure of R: {closure(relation_R, domain_A, 'transitive')}")
    # Expected transitive closure of R: {(1, 1), (1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)}
    # Let's trace R = {(1, 1), (1, 2), (2, 3), (3, 1)}
    # (1,1),(1,2)->(1,2) exists
    # (1,2),(2,3)->(1,3) ADD
    # (2,3),(3,1)->(2,1) ADD
    # (3,1),(1,1)->(3,1) exists
    # (3,1),(1,2)->(3,2) ADD
    # Now check new pairs:
    # (1,3),(3,1)->(1,1) exists
    # (1,3),(3,2)->(1,2) exists
    # (2,1),(1,1)->(2,1) exists
    # (2,1),(1,2)->(2,2) ADD
    # (2,1),(1,3)->(2,3) exists
    # (3,2),(2,1)->(3,1) exists
    # (3,2),(2,3)->(3,3) ADD
    # Now check new pairs:
    # (2,2),(2,1)->(2,1) exists
    # (2,2),(2,3)->(2,3) exists
    # (1,2),(2,2)->(1,2) exists
    # (3,3),(3,1)->(3,1) exists
    # (3,3),(3,2)->(3,2) exists
    # (2,3),(3,3)->(2,3) exists
    # Final: {(1, 1), (1, 2), (2, 3), (3, 1), (1, 3), (2, 1), (3, 2), (2, 2), (3, 3)}
    # Let's re-run the code's output for transitive closure of R.
    # Output: {(1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (2, 3), (3, 1), (3, 2), (3, 3)}
    # Looks correct. My manual trace missed (2,2) and (3,3) initially.

    print(f"Transitive closure of P: {closure(relation_P, domain_A, 'transitive')}") # Should be P itself
