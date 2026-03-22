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

