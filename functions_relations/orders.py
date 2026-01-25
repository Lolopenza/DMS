from set_theory.relations import (
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

if __name__ == '__main__':
    domain_A = {1, 2, 3}
    
    relation_eq = {(1, 1), (2, 2), (3, 3), (1, 3), (3, 1)}
    print("--- Equivalence Relation Example --- Domain A")
    print(f"Relation Eq = {relation_eq}")
    is_eq = is_equivalence_relation(relation_eq, domain_A)
    print(f"Is Eq an equivalence relation? {is_eq}")
    if is_eq:
        classes = find_equivalence_classes(relation_eq, domain_A)
        print(f"Equivalence Classes: {[set(c) for c in classes]}") 

    domain_B = {1, 2, 3, 4}
    relation_po = {(a, b) for a in domain_B for b in domain_B if b % a == 0}
    print("\n--- Partial Order Example --- Domain B = {1, 2, 3, 4}")
    print(f"Relation PO (divides) = {relation_po}")
    is_po = is_partial_order(relation_po, domain_B)
    print(f"Is PO a partial order? {is_po}")
    if is_po:
        is_to = is_total_order(relation_po, domain_B)
        print(f"Is PO a total order? {is_to}") 
        hasse_edges = hasse_diagram_elements(relation_po, domain_B)
        print(f"Hasse Diagram Edges (Covers): {hasse_edges}")

    relation_to = {(a, b) for a in domain_A for b in domain_A if a <= b}
    print("\n--- Total Order Example --- Domain A = {1, 2, 3}")
    print(f"Relation TO (<=) = {relation_to}")
    is_po_2 = is_partial_order(relation_to, domain_A)
    print(f"Is TO a partial order? {is_po_2}")
    if is_po_2:
        is_to_2 = is_total_order(relation_to, domain_A)
        print(f"Is TO a total order? {is_to_2}") 
        hasse_edges_2 = hasse_diagram_elements(relation_to, domain_A)
        print(f"Hasse Diagram Edges (Covers): {hasse_edges_2}")

    relation_not_po = {(1, 1), (2, 2), (1, 2), (2, 1)}
    print("\n--- Not Partial Order Example --- Domain {1, 2}")
    print(f"Relation Not PO = {relation_not_po}")
    print(f"Is Not PO a partial order? {is_partial_order(relation_not_po, {1, 2})}")
        is_to = is_total_order(relation_po, domain_B)
        print(f"Is PO a total order? {is_to}") 
        hasse_edges = hasse_diagram_elements(relation_po, domain_B)
        print(f"Hasse Diagram Edges (Covers): {hasse_edges}")

    relation_to = {(a, b) for a in domain_A for b in domain_A if a <= b}
    print("\n--- Total Order Example --- Domain A = {1, 2, 3}")
    print(f"Relation TO (<=) = {relation_to}")
    is_po_2 = is_partial_order(relation_to, domain_A)
    print(f"Is TO a partial order? {is_po_2}")
    if is_po_2:
        is_to_2 = is_total_order(relation_to, domain_A)
        print(f"Is TO a total order? {is_to_2}") 
        hasse_edges_2 = hasse_diagram_elements(relation_to, domain_A)
        print(f"Hasse Diagram Edges (Covers): {hasse_edges_2}")

    relation_not_po = {(1, 1), (2, 2), (1, 2), (2, 1)}
    print("\n--- Not Partial Order Example --- Domain {1, 2}")
    print(f"Relation Not PO = {relation_not_po}")
    print(f"Is Not PO a partial order? {is_partial_order(relation_not_po, {1, 2})}")
    relation_not_po = {(1, 1), (2, 2), (1, 2), (2, 1)}
    print("\n--- Not Partial Order Example --- Domain {1, 2}")
    print(f"Relation Not PO = {relation_not_po}")
    print(f"Is Not PO a partial order? {is_partial_order(relation_not_po, {1, 2})}") # False
