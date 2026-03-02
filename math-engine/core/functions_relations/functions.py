def is_function(domain, codomain, mapping):
    if not isinstance(domain, set):
        raise TypeError("Domain must be a set")
    if not isinstance(codomain, set):
        raise TypeError("Codomain must be a set")
    if not isinstance(mapping, dict):
        raise TypeError("Mapping must be a dictionary")

    if set(mapping.keys()) != domain:
        missing = domain - set(mapping.keys())
        extra = set(mapping.keys()) - domain
        error_msg = "Mapping does not cover the entire domain or has extra keys."
        if missing:
            error_msg += f" Missing domain elements: {missing}."
        if extra:
            error_msg += f" Extra keys in mapping: {extra}."
        raise ValueError(error_msg)

    for domain_element, mapped_value in mapping.items():
        if mapped_value not in codomain:
            raise ValueError(f"Mapped value '{mapped_value}' for domain element '{domain_element}' is not in the codomain {codomain}")
            
    return True 

def is_injective(f, domain):
    seen = set()
    for x in domain:
        y = f(x)
        if y in seen:
            return False
        seen.add(y)
    return True

def is_surjective(f, domain, codomain):
    images = set(f(x) for x in domain)
    return images == set(codomain)

def is_bijective(f, domain, codomain):
    return is_injective(f, domain) and is_surjective(f, domain, codomain)
def compose_functions(f, g, domain_f):
    composition = {}
    for x in domain_f:
        if x in g and g[x] in f:
            composition[x] = f[g[x]]
    return composition

def inverse_function(domain, codomain, mapping):
    if not is_bijective(domain, codomain, mapping):
        return None
    
    return {v: k for k, v in mapping.items()}

def function_image(mapping, subset):
    return {mapping[x] for x in subset if x in mapping}

def function_preimage(mapping, subset):
    return {x for x in mapping if mapping[x] in subset}

if __name__ == '__main__':
    domain1 = [-2, -1, 0, 1, 2]
    codomain1 = [0, 1, 4]
    f1 = {-2: 4, -1: 1, 0: 0, 1: 1, 2: 4}
    
    print("Function f(x) = x² with domain {-2, -1, 0, 1, 2}:")
    print(f"Is a valid function? {is_function(domain1, codomain1, f1)}")
    print(f"Is injective? {is_injective(f1, domain1)}")
    print(f"Is surjective? {is_surjective(f1, domain1, codomain1)}")
    print(f"Is bijective? {is_bijective(f1, domain1, codomain1)}")
    
    domain2 = [1, 2, 3]
    codomain2 = ['a', 'b', 'c']
    f2 = {1: 'a', 2: 'b', 3: 'c'}
    
    print("\nFunction mapping {1,2,3} to {'a','b','c'}:")
    print(f"Is a valid function? {is_function(domain2, codomain2, f2)}")
    print(f"Is injective? {is_injective(f2, domain2)}")
    print(f"Is surjective? {is_surjective(f2, domain2, codomain2)}")
    print(f"Is bijective? {is_bijective(f2, domain2, codomain2)}")
    
    inv = inverse_function(domain2, codomain2, f2)
    print(f"Inverse function: {inv}")
    
    g = {1: 2, 2: 3, 3: 1}
    h = {1: 'c', 2: 'a', 3: 'b'}
    comp = compose_functions(h, g, [1, 2, 3])
    print(f"\nComposition h ∘ g: {comp}")
    
    subset1 = {1, 2}
    img = function_image(f2, subset1)
    print(f"\nImage of {subset1} under f2: {img}")
    
    subset2 = {'a', 'b'}
    preimg = function_preimage(f2, subset2)
    print(f"Preimage of {subset2} under f2: {preimg}")
    img = function_image(f2, subset1)
    print(f"\nImage of {subset1} under f2: {img}")
    
    subset2 = {'a', 'b'}
    preimg = function_preimage(f2, subset2)
    print(f"Preimage of {subset2} under f2: {preimg}")

