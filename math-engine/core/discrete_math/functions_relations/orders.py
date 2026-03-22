from core.discrete_math.set_theory.relations import (
    is_reflexive, is_symmetric, is_transitive, is_antisymmetric,
    closure, is_relation 
)

def is_equivalence_relation(relation, domain):
    if not is_relation(relation, domain): 
        return False 
        
    return (
        is_reflexive(relation, domain) and
        is_symmetric(relation) and
        is_transitive(relation)
    )

def is_partial_order(relation, domain):
    if not is_relation(relation, domain):
        return False
        
    return (
        is_reflexive(relation, domain) and
        is_antisymmetric(relation) and
        is_transitive(relation)
    )

def is_total_order(relation, domain):
    if not is_partial_order(relation, domain):
        return False
        
    for a in domain:
        for b in domain:
            if (a, b) not in relation and (b, a) not in relation:
                return False
    return True

def find_equivalence_classes(relation, domain):
    if not is_equivalence_relation(relation, domain):
        raise ValueError("Input relation is not an equivalence relation")
        
    classes = []
    visited = set()
    
    for element in domain:
        if element not in visited:
            current_class = set()
            for other_element in domain:
                 if (element, other_element) in relation: 
                     current_class.add(other_element)
            
            classes.append(frozenset(current_class)) 
            visited.update(current_class)
            
    return classes

def hasse_diagram_elements(relation, domain):
    if not is_partial_order(relation, domain):
        raise ValueError("Input relation is not a partial order")
        
    covers = set()
    for a, b in relation:
        if a == b:
            continue 
            
        is_covered = True
        for c in domain:
            if c != a and c != b:
                if (a, c) in relation and (c, b) in relation:
                    is_covered = False
                    break 
                    
        if is_covered:
            covers.add((a, b))
            
    return covers
