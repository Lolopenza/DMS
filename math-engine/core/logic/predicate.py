class Predicate:
    def __init__(self, name, arity):
        self.name = name
        self.arity = arity
        self.extension = set()  

    def add_true_case(self, *args):
        if len(args) != self.arity:
            raise ValueError(f"Predicate {self.name} expects {self.arity} arguments")
        self.extension.add(args)

    def evaluate(self, *args):
        if len(args) != self.arity:
            raise ValueError(f"Predicate {self.name} expects {self.arity} arguments")
        return args in self.extension

    def __str__(self):
        return f"{self.name}({', '.join(['_'] * self.arity)})"

class UniversalQuantifier:
    def __init__(self, variable, formula):
        self.variable = variable
        self.formula = formula
        
    def __str__(self):
        return f"∀{self.variable}({self.formula})"
        
class ExistentialQuantifier:
    def __init__(self, variable, formula):
        self.variable = variable
        self.formula = formula
        
    def __str__(self):
        return f"∃{self.variable}({self.formula})"

class IsEven(Predicate):
    def __init__(self):
        super().__init__("Even", 1)
        
    def evaluate(self, x):
        return x % 2 == 0
        
class IsGreaterThan(Predicate):
    def __init__(self):
        super().__init__("GreaterThan", 2)
        
    def evaluate(self, x, y):
        return x > y

def check_validity(formula, domain):
    if not domain:
        raise ValueError("Domain cannot be empty for validity check.")

    if isinstance(formula, UniversalQuantifier):
        predicate = formula.formula
        if not isinstance(predicate, Predicate):
            raise NotImplementedError("Validity check only implemented for simple quantified predicates.")
        if predicate.arity != 1:
             raise NotImplementedError("Validity check currently only supports unary predicates.")
        
        return all(predicate.evaluate(x) for x in domain)
        
    elif isinstance(formula, ExistentialQuantifier):
        predicate = formula.formula
        if not isinstance(predicate, Predicate):
            raise NotImplementedError("Validity check only implemented for simple quantified predicates.")
        if predicate.arity != 1:
             raise NotImplementedError("Validity check currently only supports unary predicates.")
             
        return any(predicate.evaluate(x) for x in domain)
        
    else:
        raise NotImplementedError("Validity checking only implemented for UniversalQuantifier and ExistentialQuantifier formulas.")

def universal_quantifier(domain, predicate, *args):
    for element in domain:
        if not predicate.evaluate(element, *args):
            return False
    return True

def existential_quantifier(domain, predicate, *args):
    for element in domain:
        if predicate.evaluate(element, *args):
            return True
    return False

def negate_predicate(predicate):
    negated = Predicate(f"NOT_{predicate.name}", predicate.arity)
    return negated

def print_predicate_truth_table(predicate, domain):
    print(f"\nTruth Table for Predicate {predicate.name}:")
    print("-" * 40)
    
    header = " | ".join([f"arg{i+1}" for i in range(predicate.arity)] + ["Result"])
    print(header)
    print("-" * len(header))
    
    from itertools import product
    for args in product(domain, repeat=predicate.arity):
        result = predicate.evaluate(*args)
        row = " | ".join(str(arg) for arg in args + (result,))
        print(row)

if __name__ == '__main__':
    domain = {1, 2, 3, 4, 5}
    
    is_even = Predicate("is_even", 1)
    for x in domain:
        if x % 2 == 0:
            is_even.add_true_case(x)
    
    is_greater_than = Predicate("is_greater_than", 2)
    for x in domain:
        for y in domain:
            if x > y:
                is_greater_than.add_true_case(x, y)
    
    print_predicate_truth_table(is_even, domain)
    print_predicate_truth_table(is_greater_than, domain)
    
    print("\nUniversal Quantifier Examples:")
    print(f"∀x is_even(x): {universal_quantifier(domain, is_even)}")
    
    print("\nExistential Quantifier Examples:")
    print(f"∃x is_even(x): {existential_quantifier(domain, is_even)}")
    
    even = IsEven()
    greater = IsGreaterThan()
    
    print(f"Is 4 even? {even.evaluate(4)}")
    print(f"Is 5 even? {even.evaluate(5)}")
    print(f"Is 7 > 3? {greater.evaluate(7, 3)}")
    print(f"Is 2 > 10? {greater.evaluate(2, 10)}")
    
    domain_small = {1, 2, 3, 4, 5}
    domain_even = {2, 4, 6, 8}
    
    formula_all_even = UniversalQuantifier('x', even)
    print(f"\nChecking {formula_all_even} over {domain_small}")
    print(f"Result: {check_validity(formula_all_even, domain_small)}") 
    print(f"Checking {formula_all_even} over {domain_even}")
    print(f"Result: {check_validity(formula_all_even, domain_even)}") 
    
    formula_exists_even = ExistentialQuantifier('x', even)
    print(f"\nChecking {formula_exists_even} over {{1, 3, 5}}")
    print(f"Result: {check_validity(formula_exists_even, {1, 3, 5})}") 
    print(f"Checking {formula_exists_even} over {domain_small}")
    print(f"Result: {check_validity(formula_exists_even, domain_small)}")
    
    is_greater_than = Predicate("is_greater_than", 2)
    for x in domain:
        for y in domain:
            if x > y:
                is_greater_than.add_true_case(x, y)
    
    print_predicate_truth_table(is_even, domain)
    print_predicate_truth_table(is_greater_than, domain)
    
    print("\nUniversal Quantifier Examples:")
    print(f"∀x is_even(x): {universal_quantifier(domain, is_even)}")
    
    print("\nExistential Quantifier Examples:")
    print(f"∃x is_even(x): {existential_quantifier(domain, is_even)}")
    
    even = IsEven()
    greater = IsGreaterThan()
    
    print(f"Is 4 even? {even.evaluate(4)}")
    print(f"Is 5 even? {even.evaluate(5)}")
    print(f"Is 7 > 3? {greater.evaluate(7, 3)}")
    print(f"Is 2 > 10? {greater.evaluate(2, 10)}")
    
    domain_small = {1, 2, 3, 4, 5}
    domain_even = {2, 4, 6, 8}
    
    formula_all_even = UniversalQuantifier('x', even)
    print(f"\nChecking {formula_all_even} over {domain_small}")
    print(f"Result: {check_validity(formula_all_even, domain_small)}") 
    print(f"Checking {formula_all_even} over {domain_even}")
    print(f"Result: {check_validity(formula_all_even, domain_even)}") 
    
    formula_exists_even = ExistentialQuantifier('x', even)
    print(f"\nChecking {formula_exists_even} over {{1, 3, 5}}")
    print(f"Result: {check_validity(formula_exists_even, {1, 3, 5})}") 
    print(f"Checking {formula_exists_even} over {domain_small}")
    print(f"Result: {check_validity(formula_exists_even, domain_small)}")
    formula_exists_even = ExistentialQuantifier('x', even)
    print(f"\nChecking {formula_exists_even} over {{1, 3, 5}}")
    print(f"Result: {check_validity(formula_exists_even, {1, 3, 5})}") # False
    print(f"Checking {formula_exists_even} over {domain_small}")
    print(f"Result: {check_validity(formula_exists_even, domain_small)}") # True
    
    # Example of unsupported (binary predicate)
    # formula_exists_greater = ExistentialQuantifier('x', greater) # This structure is wrong
    # Need something like Exists x Exists y such that GreaterThan(x, y)
    # print(f"\nChecking Exists x GreaterThan(x,_) over {domain_small}")
    # try:
    #     check_validity(formula_exists_greater, domain_small)
    # except NotImplementedError as e:
    #     print(f"Caught expected error: {e}")
