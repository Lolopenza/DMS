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

