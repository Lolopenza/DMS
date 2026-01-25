import importlib
import sys

REQUIRED_PACKAGES = {
    "sympy": "sympy",
    "numpy": "numpy",
    "matplotlib": "matplotlib",
    "networkx": "networkx",
    "flask": "Flask",
    "flask_cors": "Flask-Cors",
    "markdown2": "markdown2",
    "pdoc3": "pdoc3"
}

OPTIONAL_PACKAGES = {
    "PyQt5": "PyQt5"
}

def check_package(package_name, import_name):
    try:
        importlib.import_module(import_name)
        print(f"[OK] {package_name} is installed.")
        return True
    except ImportError:
        print(f"[Missing] {package_name} is not installed.")
        return False

def main():
    print("Checking required dependencies...")
    all_required_installed = True
    missing_required = []
    
    for package, import_name in REQUIRED_PACKAGES.items():
        if not check_package(package, import_name):
            all_required_installed = False
            missing_required.append(package)
            
    print("\nChecking optional dependencies...")
    missing_optional = []
    for package, import_name in OPTIONAL_PACKAGES.items():
        if not check_package(package, import_name):
            missing_optional.append(package)
            
    print("\n--- Summary ---")
    if all_required_installed:
        print("All required dependencies are installed.")
    else:
        print("Some required dependencies are missing:")
        print(f"  {' '.join(missing_required)}")
        print("Please install them using pip:")
        print(f"  pip install {' '.join(missing_required)}")
        
    if missing_optional:
        print("\nSome optional dependencies are missing:")
        print(f"  {' '.join(missing_optional)}")
        print("These are needed for specific features (e.g., GUI).")
        print("You can install them using pip if needed:")
        print(f"  pip install {' '.join(missing_optional)}")
    else:
        print("All optional dependencies checked are installed.")
        
    if not all_required_installed:
        sys.exit(1)

if __name__ == "__main__":
    main()
