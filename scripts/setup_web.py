import subprocess
import sys
import os
import importlib
from pathlib import Path

def check_pip():
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "--version"])
        return True
    except subprocess.CalledProcessError:
        print("Error: pip is not available. Please install pip.")
        return False
    except FileNotFoundError:
        print(f"Error: Python executable '{sys.executable}' not found.")
        return False

def install_requirements(requirements_file="requirements.txt"):
    if not check_pip():
        return False
        
    if not os.path.exists(requirements_file):
        print(f"Error: '{requirements_file}' not found.")
        return False
        
    print(f"Installing dependencies from {requirements_file}...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
        print("Dependencies installed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

def check_dependencies():
    required_packages = [
        'flask', 'flask_cors', 'sympy', 'numpy', 'matplotlib', 'networkx', 'openai', 'python-dotenv', 'marshmallow', 'jsonschema'
    ]
    
    missing_packages = []
    
    print("Checking required dependencies...")
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✓ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package} is not installed")
    
    if missing_packages:
        print("\nMissing dependencies. Install them using:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_directory_structure():
    base_dir = Path(__file__).parent
    
    required_dirs = [
        'templates',
        'static',
        'static/css',
        'static/js',
        'static/js/automata', 
        'static/images',
        'logic',
        'set_theory',
        'combinatorics',
        'number_theory',
        'graph_theory',
        'automata',
        'discrete_probability',
        'utils',
        'algebraic_structures', 
        'functions_relations' 
    ]
    
    print("\nChecking directory structure...")
    for directory in required_dirs:
        dir_path = base_dir / directory
        if not dir_path.exists():
            print(f"Creating directory: {directory}")
            dir_path.mkdir(parents=True, exist_ok=True)
        else:
            print(f"✓ Directory exists: {directory}")
    
    return True

def check_core_files():
    base_dir = Path(__file__).parent
    
    essential_files = [
        'web_app.py',
        'templates/base.html', 
        'templates/index.html',
        'static/css/style.css',
        'static/js/main.js', 
        'requirements.txt' 
    ]
    
    missing_files = []
    
    print("\nChecking essential files...")
    for file_path in essential_files:
        full_path = base_dir / file_path
        if not full_path.exists():
            missing_files.append(file_path)
            print(f"✗ Missing file: {file_path}")
        else:
            print(f"✓ File exists: {file_path}")
    
    if missing_files:
        print("\nWarning: Some essential files are missing!")
        print("Make sure they are created before running the web application.")
        return False
    
    return True

def create_init_files():
    base_dir = Path(__file__).parent
    
    module_dirs = [
        '.', 
        'logic',
        'set_theory',
        'combinatorics',
        'number_theory',
        'graph_theory',
        'automata',
        'discrete_probability',
        'utils',
        'algebraic_structures',
        'functions_relations',
        'docs', 
        'tests' 
    ]
    
    print("\nCreating __init__.py files in module directories...")
    for directory in module_dirs:
        dir_path = base_dir / directory
        if not dir_path.exists():
            print(f"Directory {directory} does not exist, skipping __init__.py creation.")
            continue
            
        init_file = dir_path / "__init__.py"
        if not init_file.exists():
            with open(init_file, 'w') as f:
                f.write("# Module initialization\n")
            print(f"Created: {init_file.relative_to(base_dir)}")
        else:
            print(f"✓ Already exists: {init_file.relative_to(base_dir)}")

def main():
    print("===== Discrete Math Calculator Web Setup =====\n")
    
    check_directory_structure()
    
    create_init_files()
    
    files_ok = check_core_files()
    
    deps_ok = check_dependencies()
    
    print("\n=== Setup Summary ===")
    if deps_ok and files_ok:
        print("✓ Setup completed successfully!")
        print("\nTo run the web application, use:")
        print("python web_app.py")
    else:
        print("⚠ Setup completed with warnings.")
        print("\nPlease address the issues above before running the application.")
        if not deps_ok:
            print("- Install missing dependencies (run 'pip install -r requirements.txt' or install manually)")
        if not files_ok:
            print("- Create missing essential files")
        
        print("\nOnce issues are resolved, run the web application with:")
        print("python web_app.py")

if __name__ == "__main__":
    main()
