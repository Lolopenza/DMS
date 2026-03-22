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

