def validate_integer(value, min_value=None, max_value=None, name="value"):
    if value is None:
        raise TypeError(f"{name} cannot be None")
    
    if not isinstance(value, int):
        raise TypeError(f"{name} must be an integer")
    
    if min_value is not None and value < min_value:
        raise ValueError(f"{name} must be at least {min_value}")
    
    if max_value is not None and value > max_value:
        raise ValueError(f"{name} must be at most {max_value}")
    
    return value

def validate_positive_integer(value, name="value"):
    return validate_integer(value, min_value=1, name=name)

def validate_non_negative_integer(value, name="value"):
    return validate_integer(value, min_value=0, name=name)

def validate_float(value, min_value=None, max_value=None, name="value"):
    if value is None:
        raise TypeError(f"{name} cannot be None")
    
    if not isinstance(value, (int, float)):
        raise TypeError(f"{name} must be a number")
    
    value = float(value)
    
    if min_value is not None and value < min_value:
        raise ValueError(f"{name} must be at least {min_value}")
    
    if max_value is not None and value > max_value:
        raise ValueError(f"{name} must be at most {max_value}")
    
    return value

def validate_probability(value, name="probability"):
    return validate_float(value, min_value=0, max_value=1, name=name)

def validate_set(value, name="set"):
    if isinstance(value, set):
        return value
    
    try:
        return set(value)
    except (TypeError, ValueError):
        raise TypeError(f"{name} must be a set or convertible to a set")

def validate_list(value, element_type=None, name="list"):
    if not isinstance(value, list):
        raise TypeError(f"{name} must be a list")
    
    if element_type is not None:
        for i, item in enumerate(value):
            if not isinstance(item, element_type):
                raise TypeError(f"Element at index {i} of {name} must be of type {element_type.__name__}")
    
    return value

def validate_function(value, name="function"):
    if not callable(value):
        raise TypeError(f"{name} must be a callable function")
    
    return value

if __name__ == '__main__':
    try:
        validate_integer(5, min_value=1, max_value=10)
        validate_positive_integer(3)
        validate_non_negative_integer(0)
        validate_float(3.14, min_value=0)
        validate_probability(0.5)
        validate_set({1, 2, 3})
        validate_list([1, 2, 3], element_type=int)
        validate_function(lambda x: x+1)
        
        print("All validations passed!")
        
    except (TypeError, ValueError) as e:
        print(f"Validation error: {e}")
