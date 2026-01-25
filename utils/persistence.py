import json
import os

def save_data(data, filename="calculator_data.json"):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        print(f"Error saving data to {filename}: {e}")
    except TypeError as e:
        print(f"Error serializing data: {e}")

def load_data(filename="calculator_data.json"):
    if not os.path.exists(filename):
        return {}
        
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except IOError as e:
        return {}
    except json.JSONDecodeError as e:
        return {}

if __name__ == '__main__':
    sample_data = {
        "last_calculation": "GCD(48, 18)",
        "history": [
            {"operation": "GCD", "inputs": [48, 18], "result": 6},
            {"operation": "Factorial", "inputs": [5], "result": 120}
        ],
        "settings": {
            "precision": 4,
            "theme": "dark"
        }
    }
    
    save_data(sample_data, "test_data.json")
    
    loaded_data = load_data("test_data.json")
    
    if loaded_data:
        print(json.dumps(loaded_data, indent=2))
        
    if os.path.exists("test_data.json"):
        os.remove("test_data.json")
