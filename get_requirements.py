#!/usr/bin/env python3
import pkg_resources
import importlib
import re
import sys

# Extract imports from file
def extract_imports(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Find import statements
    import_lines = re.findall(r'^(?:import|from)\s+([a-zA-Z0-9_.]+)', content, re.MULTILINE)
    
    # Extract the base package names
    packages = set()
    for imp in import_lines:
        # Get base package name (first part of the import)
        base_package = imp.split('.')[0]
        # Skip standard library modules
        if not base_package in sys.builtin_module_names and base_package != 'builtins':
            packages.add(base_package)
    
    return packages

# Get version of a package
def get_package_version(package):
    try:
        return pkg_resources.get_distribution(package).version
    except pkg_resources.DistributionNotFound:
        return None

# Main function
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_requirements.py <path_to_python_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    packages = extract_imports(file_path)
    
    with open('requirements.txt', 'w') as req_file:
        for package in sorted(packages):
            version = get_package_version(package)
            if version:
                req_file.write(f"{package}=={version}\n")
            else:
                req_file.write(f"# {package} - version not found, please add manually\n")
    
    print(f"Requirements file generated: requirements.txt") 