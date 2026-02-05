from typing import Any, Callable, List

def is_associative(op: Callable[[Any, Any], Any], elements: List[Any]) -> bool:
    for a in elements:
        for b in elements:
            for c in elements:
                if op(op(a, b), c) != op(a, op(b, c)):
                    return False
    return True

def has_identity(op: Callable[[Any, Any], Any], elements: List[Any]) -> Any:
    for e in elements:
        if all(op(e, a) == a and op(a, e) == a for a in elements):
            return e
    return None

def has_inverses(op: Callable[[Any, Any], Any], elements: List[Any], identity: Any) -> bool:
    for a in elements:
        if not any(op(a, b) == identity and op(b, a) == identity for b in elements):
            return False
    return True

def is_group(op: Callable[[Any, Any], Any], elements: List[Any]) -> bool:
    if not is_associative(op, elements):
        return False
    identity = has_identity(op, elements)
    if identity is None:
        return False
    if not has_inverses(op, elements, identity):
        return False
    return True

class Group:
    def __init__(self, elements, operation, identity=None):
        self.elements = list(elements)
        self.operation = operation
        
        self.cayley_table = {}
        for a in self.elements:
            for b in self.elements:
                self.cayley_table[(a, b)] = operation(a, b)
        
        for a in self.elements:
            for b in self.elements:
                result = self.cayley_table[(a, b)]
                if result not in self.elements:
                    raise ValueError(f"Not closed: {a} * {b} = {result}, which is not in the group")
        
        if identity is None:
            for e in self.elements:
                if all(self.cayley_table[(e, a)] == a and self.cayley_table[(a, e)] == a for a in self.elements):
                    self.identity = e
                    break
            else:
                raise ValueError("No identity element found")
        else:
            if not all(self.cayley_table[(identity, a)] == a and self.cayley_table[(a, identity)] == a for a in self.elements):
                raise ValueError(f"Provided element {identity} is not an identity")
            self.identity = identity
        
        self.inverses = {}
        for a in self.elements:
            for b in self.elements:
                if self.cayley_table[(a, b)] == self.identity and self.cayley_table[(b, a)] == self.identity:
                    self.inverses[a] = b
                    break
            else:
                raise ValueError(f"No inverse found for {a}")
        
        for a in self.elements:
            for b in self.elements:
                for c in self.elements:
                    if self.operation(self.operation(a, b), c) != self.operation(a, self.operation(b, c)):
                        raise ValueError(f"Not associative: ({a} * {b}) * {c} ≠ {a} * ({b} * {c})")
    
    def order(self):
        return len(self.elements)
    
    def element_order(self, element):
        if element not in self.elements:
            raise ValueError(f"Element {element} not in group")
        
        result = element
        order = 1
        
        while result != self.identity:
            result = self.operation(result, element)
            order += 1
            
            if order > len(self.elements):
                return "Error: Could not determine element order"
        
        return order
    
    def is_abelian(self):
        for a in self.elements:
            for b in self.elements:
                if self.cayley_table[(a, b)] != self.cayley_table[(b, a)]:
                    return False
        return True
    
    def print_cayley_table(self):
        print("Cayley Table:")
        header = "   | " + " | ".join(str(e) for e in self.elements)
        print(header)
        print("-" * len(header))
        
        for a in self.elements:
            row = f" {a} | " + " | ".join(str(self.cayley_table[(a, b)]) for b in self.elements)
            print(row)
    
    def __str__(self):
        return f"Group of order {self.order()} with identity {self.identity}"

if __name__ == '__main__':
    def mod4_add(a, b):
        return (a + b) % 4
    
    try:
        Z4 = Group([0, 1, 2, 3], mod4_add, 0)
        print(Z4)
        print(f"Is abelian: {Z4.is_abelian()}")
        Z4.print_cayley_table()
        
        print("\nElement orders:")
        for e in Z4.elements:
            print(f"Order of {e}: {Z4.element_order(e)}")
    except ValueError as e:
        print(f"Error creating group: {e}")
    
    def compose_permutations(p1, p2):
        return tuple(p1[p2[i]] for i in range(len(p1)))
    
    try:
        S3_elements = [
            (0, 1, 2),
            (0, 2, 1),
            (1, 0, 2),
            (1, 2, 0),
            (2, 0, 1),
            (2, 1, 0)
        ]
        
        S3 = Group(S3_elements, compose_permutations, (0, 1, 2))
        print("\n" + str(S3))
        print(f"Is abelian: {S3.is_abelian()}")
        
        print("\nElement orders:")
        for e in S3.elements:
            print(f"Order of {e}: {Z4.element_order(e)}")
    except ValueError as e:
        print(f"Error creating group: {e}")
