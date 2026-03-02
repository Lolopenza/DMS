def get_integer_input(prompt, min_value=None, max_value=None):
    while True:
        try:
            value = input(prompt)
            if not value.strip():
                print("Input cannot be empty.")
                continue
                
            result = int(value)
            
            if min_value is not None and result < min_value:
                print(f"Value must be at least {min_value}.")
                continue
                
            if max_value is not None and result > max_value:
                print(f"Value must be at most {max_value}.")
                continue
                
            return result
        except ValueError:
            print("Please enter a valid integer.")
        except KeyboardInterrupt:
            print("\nOperation cancelled.")
            return None

def get_float_input(prompt, min_value=None, max_value=None):
    while True:
        try:
            value = input(prompt)
            result = float(value)
            
            if min_value is not None and result < min_value:
                print(f"Value must be at least {min_value}.")
                continue
                
            if max_value is not None and result > max_value:
                print(f"Value must be at most {max_value}.")
                continue
                
            return result
        except ValueError:
            print("Please enter a valid number.")

def get_boolean_input(prompt):
    while True:
        value = input(f"{prompt} (y/n): ").lower().strip()
        if value in ['y', 'yes', 'true', 't', '1']:
            return True
        elif value in ['n', 'no', 'false', 'f', '0']:
            return False
        else:
            print("Please enter 'y' or 'n'.")

def get_set_input(prompt, element_type=int):
    while True:
        try:
            value = input(f"{prompt}: ")
            value = value.strip().strip('{}')
            elements = [x.strip() for x in value.split(',')]
            
            if element_type == int:
                result = set(int(x) for x in elements if x)
            elif element_type == float:
                result = set(float(x) for x in elements if x)
            elif element_type == str:
                result = set(x for x in elements if x)
            else:
                print(f"Unsupported element type: {element_type}")
                continue
                
            return result
        except ValueError:
            print(f"Please enter valid {element_type.__name__} values separated by commas.")

def format_set(s):
    return "{" + ", ".join(str(x) for x in s) + "}"

def format_ordered_pair(pair):
    return f"({pair[0]}, {pair[1]})"

def format_relation(relation):
    pairs = [format_ordered_pair(pair) for pair in relation]
    return "{" + ", ".join(pairs) + "}"

def format_matrix(matrix, precision=2):
    result = []
    for row in matrix:
        formatted_row = []
        for value in row:
            if isinstance(value, float):
                formatted_row.append(f"{value:.{precision}f}")
            else:
                formatted_row.append(str(value))
        result.append(" ".join(formatted_row))
    return "\n".join(result)

if __name__ == '__main__':
    print("Example usage of input helpers:")
    
    n = get_integer_input("Enter a positive integer: ", min_value=1)
    print(f"You entered: {n}")
    
    s = get_set_input("Enter a set of integers")
    print(f"Set: {format_set(s)}")
    
    relation = {(1, 2), (2, 3), (1, 3)}
    print(f"Relation: {format_relation(relation)}")
    
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    print(f"Matrix:\n{format_matrix(matrix)}")
