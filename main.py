import sys
from logic import propositional, predicate
from set_theory import set_operations, relations
from combinatorics import basic as combinatorics_basic, advanced as combinatorics_advanced
from number_theory import divisibility, cryptography
from graph_theory import basics as graph_basics, algorithms as graph_algorithms
from functions_relations import functions, orders
from discrete_probability import basic_probability, random_variables
from utils.input_helpers import get_integer_input, get_set_input, get_boolean_input, get_float_input
from utils.validation import validate_integer, validate_set
from utils.persistence import save_data, load_data
from visualization import graph_viz
import math
import os
from algebraic_structures import boolean_algebra, groups
from automata.finite_automata import DFA 
from automata.dfa import DFA as ConcreteDFA 
from automata.nfa import NFA
from automata.regex import RegexToNFA
from automata.simulation import AutomatonSimulator

try:
    from visualization import graph_viz
    has_visualization = True
except ImportError:
    has_visualization = False

def display_menu(title, options):
    print(f"\n--- {title} ---")
    for i, option in enumerate(options, 1):
        print(f"{i}. {option}")
    print("0. Back to main menu")
    return input("Choose an option: ")

def logic_menu():
    options = [
        "Propositional Logic",
        "Predicate Logic",
        "Proof Techniques"
    ]
    while True:
        choice = display_menu("Logic Calculator", options)
        if choice == '1':
            propositional_logic_menu()
        elif choice == '2':
            predicate_logic_menu()
        elif choice == '3':
            proof_techniques_menu()
        elif choice == '0':
            return
        else:
            print("Invalid choice.")
        input("Press Enter to continue...")

def propositional_logic_menu():
    options = [
        "Truth table for P AND (Q OR NOT P)",
        "Truth table for (P -> Q)",
        "Custom propositional formula"
    ]
    choice = display_menu("Propositional Logic", options)
    if choice == '1':
        variables = ['P', 'Q']
        expr = lambda p, q: propositional.conjoin(p, propositional.disjoin(q, propositional.negate(p)))
        headers, table_data = propositional.generate_truth_table(variables, expr)
        propositional.print_truth_table(headers, table_data)
    elif choice == '2':
        variables = ['P', 'Q']
        expr = lambda p, q: propositional.implies(p, q)
        headers, table_data = propositional.generate_truth_table(variables, expr)
        propositional.print_truth_table(headers, table_data)
    elif choice == '3':
        print("\nEnter your propositional formula using the following operators:")
        print("AND: &")
        print("OR: |")
        print("NOT: ~")
        print("IMPLIES: ->")
        print("IF AND ONLY IF: <->")
        print("\nExample: (P & Q) | (~P -> Q)")
        
        formula = input("\nEnter your formula: ").strip()
        try:
            variables = sorted(list(set(c for c in formula if c.isalpha() and c.isupper())))
            if not variables:
                print("Error: No uppercase variables (P, Q, R...) found in the formula.")
                return
                
            expr_func = propositional.parse_formula(formula)
            if expr_func is None:
                print("Error: Invalid formula syntax or unsupported structure.")
                return
                
            headers, table_data = propositional.generate_truth_table(variables, expr_func)
            propositional.print_truth_table(headers, table_data)
            
        except Exception as e:
            print(f"Error processing formula: {str(e)}")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def predicate_logic_menu():
    options = [
        "Create and Evaluate Predicate",
        "Universal Quantifier",
        "Existential Quantifier",
        "Predicate Truth Table"
    ]
    while True:
        choice = display_menu("Predicate Logic", options)
        if choice == '1':
            create_predicate_interactive()
        elif choice == '2':
            universal_quantifier_interactive()
        elif choice == '3':
            existential_quantifier_interactive()
        elif choice == '4':
            predicate_truth_table_interactive()
        elif choice == '0':
            return
        else:
            print("Invalid choice.")
        input("Press Enter to continue...")

def create_predicate_interactive():
    print("\nCreate a new predicate:")
    name = input("Enter predicate name: ").strip()
    try:
        arity = int(input("Enter predicate arity (number of arguments): "))
        if arity < 1:
            print("Error: Arity must be at least 1")
            return
    except ValueError:
        print("Error: Arity must be a positive integer")
        return
    
    p = predicate.Predicate(name, arity)
    
    print("\nEnter the domain elements (comma-separated integers):")
    try:
        domain_str = input().split(',')
        domain = set()
        for x_str in domain_str:
            x_str = x_str.strip()
            if not x_str: continue 
            try:
                domain.add(int(x_str))
            except ValueError:
                domain.add(x_str) 
    except ValueError:
        print("Error: Domain must contain valid elements (integers or strings)")
        return
    
    print("\nFor each tuple in the domain, enter 'y' if the predicate is true, 'n' if false:")
    from itertools import product
    for args in product(domain, repeat=arity):
        while True:
            response = input(f"{p.name}({', '.join(map(str, args))})? (y/n): ").lower()
            if response in ['y', 'n']:
                if response == 'y':
                    p.add_true_case(*args)
                break
            print("Please enter 'y' or 'n'")
    
    print(f"\nPredicate {name} created successfully!")
    return p

def universal_quantifier_interactive():
    p = create_predicate_interactive()
    if not p:
        return
    
    print("\nEnter the domain elements (comma-separated integers or strings):")
    try:
        domain_str = input().split(',')
        domain = set()
        for x_str in domain_str:
            x_str = x_str.strip()
            if not x_str: continue
            try:
                domain.add(int(x_str))
            except ValueError:
                domain.add(x_str)
    except ValueError:
        print("Error: Domain must contain valid elements")
        return
    
    result = p.universal_quantifier(domain)
    print(f"\n∀x {p.name}(x) is {result} over the domain {domain}")

def existential_quantifier_interactive():
    p = create_predicate_interactive()
    if not p:
        return
    
    print("\nEnter the domain elements (comma-separated integers or strings):")
    try:
        domain_str = input().split(',')
        domain = set()
        for x_str in domain_str:
            x_str = x_str.strip()
            if not x_str: continue
            try:
                domain.add(int(x_str))
            except ValueError:
                domain.add(x_str)
    except ValueError:
        print("Error: Domain must contain valid elements")
        return
    
    result = p.existential_quantifier(domain)
    print(f"\n∃x {p.name}(x) is {result} over the domain {domain}")

def predicate_truth_table_interactive():
    p = create_predicate_interactive()
    if not p:
        return
    
    print("\nEnter the domain elements (comma-separated integers or strings):")
    try:
        domain_str = input().split(',')
        domain = set()
        for x_str in domain_str:
            x_str = x_str.strip()
            if not x_str: continue
            try:
                domain.add(int(x_str))
            except ValueError:
                domain.add(x_str)
    except ValueError:
        print("Error: Domain must contain valid elements")
        return
    
    p.print_predicate_truth_table(domain)

def proof_techniques_menu():
    options = [
        "Direct Proof",
        "Proof by Contradiction",
        "Proof by Contraposition",
        "Mathematical Induction"
    ]
    while True:
        choice = display_menu("Proof Techniques", options)
        if choice == '1':
            direct_proof_interactive()
        elif choice == '2':
            contradiction_proof_interactive()
        elif choice == '3':
            contraposition_proof_interactive()
        elif choice == '4':
            induction_proof_interactive()
        elif choice == '0':
            return
        else:
            print("Invalid choice.")
        input("Press Enter to continue...")

def direct_proof_interactive():
    print("\nDirect Proof Helper")
    print("This tool helps you structure a direct proof.")
    
    print("\nEnter your theorem statement:")
    theorem = input("Theorem: ").strip()
    
    print("\nEnter your assumptions (one per line, empty line to finish):")
    assumptions = []
    while True:
        assumption = input().strip()
        if not assumption:
            break
        assumptions.append(assumption)
    
    print("\nEnter your proof steps (one per line, empty line to finish):")
    steps = []
    while True:
        step = input().strip()
        if not step:
            break
        steps.append(step)
    
    print("\nEnter your conclusion:")
    conclusion = input("Conclusion: ").strip()
    
    print("\n=== Direct Proof ===")
    print(f"Theorem: {theorem}")
    print("\nAssumptions:")
    for i, assumption in enumerate(assumptions, 1):
        print(f"{i}. {assumption}")
    
    print("\nProof:")
    for i, step in enumerate(steps, 1):
        print(f"{i}. {step}")
    
    print(f"\nTherefore, {conclusion}")
    print("Q.E.D.")

def contradiction_proof_interactive():
    print("\nProof by Contradiction Helper")
    print("This tool helps you structure a proof by contradiction.")
    
    print("\nEnter your theorem statement:")
    theorem = input("Theorem: ").strip()
    
    print("\nEnter your assumptions (one per line, empty line to finish):")
    assumptions = []
    while True:
        assumption = input().strip()
        if not assumption:
            break
        assumptions.append(assumption)
    
    print("\nEnter the negation of what you want to prove:")
    negation = input("Negation: ").strip()
    
    print("\nEnter your contradiction steps (one per line, empty line to finish):")
    steps = []
    while True:
        step = input().strip()
        if not step:
            break
        steps.append(step)
    
    print("\nEnter the contradiction you derived:")
    contradiction = input("Contradiction: ").strip()
    
    print("\n=== Proof by Contradiction ===")
    print(f"Theorem: {theorem}")
    print("\nAssumptions:")
    for i, assumption in enumerate(assumptions, 1):
        print(f"{i}. {assumption}")
    
    print(f"\nAssume for contradiction: {negation}")
    print("\nProof:")
    for i, step in enumerate(steps, 1):
        print(f"{i}. {step}")
    
    print(f"\nThis leads to a contradiction: {contradiction}")
    print("Therefore, our assumption was false.")
    print("Q.E.D.")

def contraposition_proof_interactive():
    print("\nProof by Contraposition Helper")
    print("This tool helps you structure a proof by contraposition.")
    
    print("\nEnter your theorem statement (in the form 'if P then Q'):")
    theorem = input("Theorem: ").strip()
    
    print("\nEnter the contrapositive statement (in the form 'if not Q then not P'):")
    contrapositive = input("Contrapositive: ").strip()
    
    print("\nEnter your proof steps (one per line, empty line to finish):")
    steps = []
    while True:
        step = input().strip()
        if not step:
            break
        steps.append(step)
    
    print("\n=== Proof by Contraposition ===")
    print(f"Original Theorem: {theorem}")
    print(f"Contrapositive: {contrapositive}")
    
    print("\nProof of Contrapositive:")
    for i, step in enumerate(steps, 1):
        print(f"{i}. {step}")
    
    print("\nSince the contrapositive is true, the original theorem is also true.")
    print("Q.E.D.")

def induction_proof_interactive():
    print("\nMathematical Induction Helper")
    print("This tool helps you structure a proof by mathematical induction.")
    
    print("\nEnter your theorem statement (in terms of n):")
    theorem = input("Theorem: ").strip()
    
    print("\nEnter the base case (n = 1):")
    base_case = input("Base Case: ").strip()
    
    print("\nEnter your inductive hypothesis (assume true for n = k):")
    hypothesis = input("Inductive Hypothesis: ").strip()
    
    print("\nEnter your inductive step (prove for n = k + 1):")
    print("Enter your proof steps (one per line, empty line to finish):")
    steps = []
    while True:
        step = input().strip()
        if not step:
            break
        steps.append(step)
    
    print("\n=== Proof by Mathematical Induction ===")
    print(f"Theorem: {theorem}")
    
    print("\nBase Case (n = 1):")
    print(base_case)
    
    print("\nInductive Hypothesis:")
    print(f"Assume {hypothesis}")
    
    print("\nInductive Step:")
    print("We need to show the statement holds for n = k + 1")
    for i, step in enumerate(steps, 1):
        print(f"{i}. {step}")
    
    print("\nBy the principle of mathematical induction, the theorem holds for all positive integers n.")
    print("Q.E.D.")

def set_theory_menu():
    options = [
        "Basic Set Operations",
        "Power Sets and Multisets",
        "Cartesian Products",
        "Axiomatic Set Theory"
    ]
    choice = display_menu("Set Theory Calculator", options)
    if choice == '1':
        basic_set_operations_interactive()
    elif choice in ['2', '3', '4']:
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def basic_set_operations_interactive():
    print("\nEnter your sets (comma-separated integers, e.g., 1,2,3,4):")
    set_a = get_set_input("Set A")
    set_b = get_set_input("Set B")
    universal = get_set_input("Universal Set (must include all elements from Sets A and B)")
    
    if not set_a.issubset(universal) or not set_b.issubset(universal):
        print("Error: Sets A and B must be subsets of the universal set.")
        return
    
    print(f"\nSet A: {set_a}")
    print(f"Set B: {set_b}")
    print(f"Universal Set U: {universal}")
    print("-"*40)
    
    print(f"A ∪ B (Union): {set_operations.set_union(set_a, set_b)}")
    print(f"A ∩ B (Intersection): {set_operations.set_intersection(set_a, set_b)}")
    print(f"A - B (Difference): {set_operations.set_difference(set_a, set_b)}")
    print(f"B - A (Difference): {set_operations.set_difference(set_b, set_a)}")
    print(f"A Δ B (Symmetric Difference): {set_operations.set_symmetric_difference(set_a, set_b)}")
    print(f"A' (Complement of A): {set_operations.set_complement(universal, set_a)}")
    print(f"B' (Complement of B): {set_operations.set_complement(universal, set_b)}")
    
    print("\nSet Relations:")
    print(f"Is A ⊆ B (Subset)? {set_operations.is_subset(set_a, set_b)}")
    print(f"Is B ⊆ A (Subset)? {set_operations.is_subset(set_b, set_a)}")
    print(f"Is A ⊂ B (Proper Subset)? {set_operations.is_proper_subset(set_a, set_b)}")
    print(f"Is B ⊂ A (Proper Subset)? {set_operations.is_proper_subset(set_b, set_a)}")
    print(f"Is A = B (Equal)? {set_operations.are_sets_equal(set_a, set_b)}")

def functions_relations_menu():
    options = [
        "Functions",
        "Relations",
        "Equivalence Relations",
        "Partial and Total Orders"
    ]
    choice = display_menu("Functions and Relations", options)
    if choice in ['1', '2', '3', '4']:
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def combinatorics_menu():
    options = [
        "Basic Counting (Factorial, Permutations, Combinations)",
        "Pigeonhole Principle",
        "Generating Functions",
        "Recurrence Relations",
        "Inclusion-Exclusion Principle"
    ]
    choice = display_menu("Combinatorics Calculator", options)
    if choice == '1':
        basic_combinatorics_menu()
    elif choice in ['2', '3', '4', '5']:
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def basic_combinatorics_menu():
    options = [
        "Factorial (n!)",
        "Permutations (nPr)",
        "Combinations (nCr)"
    ]
    choice = display_menu("Basic Combinatorics", options)
    if choice == '1':
        n = int(input("Enter n (non-negative integer): "))
        print(f"{n}! = {combinatorics_basic.factorial(n)}")
    elif choice == '2':
        n = int(input("Enter n (non-negative integer): "))
        r = int(input("Enter r (0 <= r <= n): "))
        print(f"P({n}, {r}) = {combinatorics_basic.permutations(n, r)}")
    elif choice == '3':
        n = int(input("Enter n (non-negative integer): "))
        r = int(input("Enter r (0 <= r <= n): "))
        print(f"C({n}, {r}) = {combinatorics_basic.combinations(n, r)}")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def graph_theory_menu():
    options = [
        "Create and Analyze Graph",
        "Graph Traversal",
        "Connectivity",
        "Minimum Spanning Tree",
        "Planar Graphs",
        "Matching and Flows"
    ]
    choice = display_menu("Graph Theory Calculator", options)
    if choice == '1':
        create_graph_interactive()
    elif choice in ['2', '3', '4', '5', '6']:
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def number_theory_menu():
    options = [
        "Divisibility and GCD/LCM",
        "Modular Arithmetic",
        "Prime Numbers",
        "Cryptography Applications"
    ]
    choice = display_menu("Number Theory Calculator", options)
    if choice == '1':
        divisibility_menu()
    elif choice == '2':
        modular_arithmetic_menu()
    elif choice == '3':
        prime_numbers_menu()
    elif choice == '4':
        cryptography_menu()
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def divisibility_menu():
    print("\n--- Divisibility Operations ---")
    a = get_integer_input("Enter first integer: ")
    b = get_integer_input("Enter second integer: ")
    
    print(f"\nGCD({a}, {b}) = {divisibility.gcd(a, b)}")
    print(f"LCM({a}, {b}) = {divisibility.lcm(a, b)}")
    
    gcd_val, x, y = divisibility.extended_gcd(a, b)
    print(f"\nExtended GCD:")
    print(f"GCD({a}, {b}) = {gcd_val}")
    print(f"{a}*({x}) + {b}*({y}) = {gcd_val}")
    
    try:
        n = abs(a)
        divs = divisibility.divisors(n)
        print(f"\nAll divisors of {n}: {divs}")
        print(f"Number of divisors: {len(divs)}")
    except ValueError as e:
        print(f"Error: {e}")

def prime_numbers_menu():
    print("\n--- Prime Number Operations ---")
    n = get_integer_input("Enter a positive integer: ")
    
    if n <= 0:
        print("Error: Please enter a positive integer.")
        return
        
    print(f"\nIs {n} prime? {divisibility.is_prime(n)}")
    
    if n > 1:
        factors = divisibility.prime_factorization(n)
        if factors:
            factorization_str = " * ".join([f"{p}^{e}" if e > 1 else str(p) for p, e in factors.items()])
            print(f"Prime factorization of {n} = {factorization_str}")
        
        print(f"Euler's totient φ({n}) = {divisibility.euler_totient(n)}")

def modular_arithmetic_menu():
    print("\n--- Modular Arithmetic ---")
    a = get_integer_input("Enter base (a): ")
    b = get_integer_input("Enter exponent (b): ")
    m = get_integer_input("Enter modulus (m): ", min_value=1)
    
    print(f"\n{a}^{b} mod {m} = {cryptography.modular_exponentiation(a, b, m)}")
    
    if divisibility.gcd(a, m) == 1:
        inv = cryptography.modular_inverse(a, m)
        print(f"Modular inverse of {a} mod {m} = {inv}")
        print(f"Verification: {a} * {inv} mod {m} = {(a * inv) % m}")
    else:
        print(f"{a} has no modular inverse mod {m} (not coprime)")

def cryptography_menu():
    print("\n--- Cryptography Applications ---")
    print("1. Generate RSA Keys")
    print("2. RSA Encryption/Decryption")
    print("0. Back")
    
    choice = input("Choose an option: ")
    
    if choice == '1':
        bits = get_integer_input("Enter bit length (8-10 recommended for demo): ", min_value=4, max_value=16)
        public_key, private_key = cryptography.generate_rsa_keys(bits)
        print(f"\nPublic Key (e, n): {public_key}")
        print(f"Private Key (d, n): {private_key}")
        
    elif choice == '2':
        print("\nGenerating small RSA keys for demonstration...")
        public_key, private_key = cryptography.generate_rsa_keys(8)
        print(f"Public Key (e, n): {public_key}")
        print(f"Private Key (d, n): {private_key}")
        
        _, n = public_key
        message = get_integer_input(f"Enter an integer message (less than {n}): ", max_value=n-1)
        
        encrypted = cryptography.rsa_encrypt(message, public_key)
        decrypted = cryptography.rsa_decrypt(encrypted, private_key)
        
        print(f"\nOriginal message: {message}")
        print(f"Encrypted message: {encrypted}")
        print(f"Decrypted message: {decrypted}")
        
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def create_graph_interactive():
    print("\n--- Create and Analyze Graph ---")
    
    directed = get_boolean_input("Is the graph directed?")
    graph = graph_basics.Graph(directed=directed)
    
    print("\nEnter vertices (one at a time, empty string to finish):")
    vertices = []
    while True:
        vertex = input("Vertex name: ").strip()
        if not vertex:
            break
        vertices.append(vertex)
        graph.add_vertex(vertex)
    
    if len(vertices) == 0:
        print("Error: Graph must have at least one vertex.")
        return
    
    print("\nAdd edges (one at a time):")
    print("Enter empty string for either vertex to finish adding edges.")
    
    while True:
        start = input("Start vertex: ").strip()
        if not start:
            break
        if start not in vertices:
            print(f"Error: '{start}' is not a vertex in the graph.")
            continue
            
        end = input("End vertex: ").strip()
        if not end:
            break
        if end not in vertices:
            print(f"Error: '{end}' is not a vertex in the graph.")
            continue
        
        weighted = get_boolean_input("Is this a weighted edge?")
        if weighted:
            weight = get_integer_input("Enter weight: ")
            graph.add_edge(start, end, weight)
            print(f"Added edge: {start} --({weight})--> {end}")
        else:
            graph.add_edge(start, end)
            print(f"Added edge: {start} --> {end}")
    
    print("\n--- Graph Analysis ---")
    print(f"Number of vertices: {len(graph.get_vertices())}")
    print(f"Number of edges: {len(graph.get_edges())}")
    print(f"Is complete? {graph.is_complete()}")
    print(f"Is bipartite? {graph.is_bipartite()}")
    
    if vertices:
        start_vertex = vertices[0]
        try:
            dfs_result = graph_algorithms.depth_first_search(graph, start_vertex)
            print(f"\nDFS from {start_vertex}: {' -> '.join(dfs_result)}")
            
            bfs_result = graph_algorithms.breadth_first_search(graph, start_vertex)
            print(f"BFS from {start_vertex}: {' -> '.join(bfs_result)}")
            
            if not graph.directed:
                components = graph_algorithms.find_connected_components(graph)
                print(f"\nConnected components: {len(components)}")
                for i, component in enumerate(components, 1):
                    print(f"  Component {i}: {component}")
                
                has_cycle_result = graph_algorithms.has_cycle_undirected(graph)
                print(f"Has cycle (undirected)? {has_cycle_result}")
            else:
                has_cycle_result = graph_algorithms.has_cycle(graph)
                print(f"Has cycle (directed)? {has_cycle_result}")
        except ValueError as e:
            print(f"Error in graph analysis: {e}")
    
    if vertices and has_visualization:
        try:
            print("\nGenerating graph visualization...")
            graph_viz.visualize_graph(graph, "Custom Graph")
        except Exception as e:
            print(f"Error generating visualization: {e}")
    elif not has_visualization:
        print("\nVisualization not available. Install matplotlib and networkx.")

def algebraic_structures_menu():
    options = [
        "Boolean Algebra",
        "Group Theory",
        "Rings and Fields"
    ]
    choice = display_menu("Algebraic Structures Calculator", options)
    if choice == '1':
        boolean_algebra_menu()
    elif choice == '2':
        group_theory_menu()
    elif choice == '3':
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def boolean_algebra_menu():
    print("\n--- Boolean Algebra Operations ---")
    print("1. Evaluate Basic Operations")
    print("2. Generate Truth Table")
    print("0. Back")
    
    choice = input("Choose an option: ")
    
    if choice == '1':
        print("\nBasic Boolean Operations:")
        x_val = get_boolean_input("Enter value for x")
        y_val = get_boolean_input("Enter value for y")
        
        print(f"NOT x = {boolean_algebra.boolean_not(x_val)}")
        print(f"x AND y = {boolean_algebra.boolean_and(x_val, y_val)}")
        print(f"x OR y = {boolean_algebra.boolean_or(x_val, y_val)}")
        print(f"x XOR y = {boolean_algebra.boolean_xor(x_val, y_val)}")
        print(f"x IMPLIES y = {boolean_algebra.boolean_implies(x_val, y_val)}")
        print(f"x EQUIV y = {boolean_algebra.boolean_equiv(x_val, y_val)}")
        
    elif choice == '2':
        vars_count = get_integer_input("How many variables? (1-3): ", min_value=1, max_value=3)
        
        if vars_count == 1:
            variables = ['x']
            print("\nSelect expression type:")
            print("1. NOT x")
            expr_choice = input("Choose an option: ")
            
            if expr_choice == '1':
                expr = lambda x: boolean_algebra.boolean_not(x)
                table = boolean_algebra.truth_table(variables, expr)
                boolean_algebra.print_truth_table(table, variables)
            else:
                print("Invalid choice.")
                
        elif vars_count == 2:
            variables = ['x', 'y']
            print("\nSelect expression type:")
            print("1. x AND y")
            print("2. x OR y")
            print("3. x XOR y")
            print("4. x IMPLIES y")
            print("5. x EQUIV y")
            expr_choice = input("Choose an option: ")
            
            expr_functions = {
                '1': lambda x, y: boolean_algebra.boolean_and(x, y),
                '2': lambda x, y: boolean_algebra.boolean_or(x, y),
                '3': lambda x, y: boolean_algebra.boolean_xor(x, y),
                '4': lambda x, y: boolean_algebra.boolean_implies(x, y),
                '5': lambda x, y: boolean_algebra.boolean_equiv(x, y)
            }
            
            if expr_choice in expr_functions:
                table = boolean_algebra.truth_table(variables, expr_functions[expr_choice])
                boolean_algebra.print_truth_table(table, variables)
            else:
                print("Invalid choice.")
                
        elif vars_count == 3:
            print("Three-variable expressions will be implemented in future versions.")
    
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def group_theory_menu():
    print("\n--- Group Theory Operations ---")
    print("1. Create and Analyze Z4 (integers mod 4)")
    print("2. Analyze Symmetric Group S3")
    print("0. Back")
    
    choice = input("Choose an option: ")
    
    if choice == '1':
        def mod4_add(a, b):
            return (a + b) % 4
        
        try:
            Z4 = groups.Group([0, 1, 2, 3], mod4_add, 0)
            print(Z4)
            print(f"Is abelian: {Z4.is_abelian()}")
            Z4.print_cayley_table()
            
            print("\nElement orders:")
            for e in Z4.elements:
                print(f"Order of {e}: {Z4.element_order(e)}")
        except ValueError as e:
            print(f"Error creating group: {e}")
            
    elif choice == '2':
        def compose_permutations(p1, p2):
            return tuple(p1[p2[i]] for i in range(len(p1)))
        
        try:
            S3_elements = [
                (0, 1, 2), 
                (0, 2, 1), 
                (1, 0, 2), 
                (1, 2, 0), 
                (2, 0, 1), 
                (2, 1, 0)  
            ]
            
            S3 = groups.Group(S3_elements, compose_permutations, (0, 1, 2))
            print(S3)
            print(f"Is abelian: {S3.is_abelian()}")
            
            print("\nElement orders:")
            for e in S3.elements:
                print(f"Order of {e}: {S3.element_order(e)}") 
        except ValueError as e:
            print(f"Error creating group: {e}")
            
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def discrete_probability_menu():
    options = [
        "Basic Probability",
        "Random Variables",
        "Distributions",
        "Conditional Probability"
    ]
    choice = display_menu("Discrete Probability Calculator", options)
    if choice == '1':
        basic_probability_menu()
    elif choice in ['2', '3', '4']:
        print(f"{options[int(choice)-1]} features will be implemented in future versions.")
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def basic_probability_menu():
    print("\n--- Basic Probability Operations ---")
    print("1. Calculate Simple Probability")
    print("2. Conditional Probability")
    print("3. Check for Independence")
    print("4. Bayes' Theorem")
    print("5. Expected Value")
    print("0. Back")
    
    choice = input("Choose an option: ")
    
    if choice == '1':
        event_size = get_integer_input("Enter number of favorable outcomes: ", min_value=0)
        sample_space_size = get_integer_input("Enter total number of possible outcomes: ", min_value=1)
        
        try:
            prob = basic_probability.simple_probability(event_size, sample_space_size)
            print(f"\nProbability = {prob:.4f}")
        except ValueError as e:
            print(f"Error: {e}")
            
    elif choice == '2':
        print("\n--- Conditional Probability P(A|B) = P(A and B) / P(B) ---")
        try:
            joint_prob = get_float_input("Enter P(A and B): ", min_value=0, max_value=1)
            condition_prob = get_float_input("Enter P(B): ", min_value=0, max_value=1)
            result = basic_probability.conditional_probability(joint_prob, condition_prob)
            print(f"Conditional Probability P(A|B) = {result:.4f}")
        except ValueError as e:
            print(f"Error: {e}")
        except ZeroDivisionError:
            print("Error: Probability of condition P(B) cannot be zero.")

    elif choice == '3':
        print("\n--- Check for Independence P(A and B) == P(A) * P(B) ---")
        try:
            prob_a = get_float_input("Enter P(A): ", min_value=0, max_value=1)
            prob_b = get_float_input("Enter P(B): ", min_value=0, max_value=1)
            joint_prob = get_float_input("Enter P(A and B): ", min_value=0, max_value=1)
            independent = basic_probability.is_independent(prob_a, prob_b, joint_prob)
            print(f"Events A and B are {'independent' if independent else 'dependent'}.")
        except ValueError as e:
            print(f"Error: {e}")

    elif choice == '4':
        print("\n--- Bayes' Theorem P(A|B) = [P(B|A) * P(A)] / P(B) ---")
        print("Where P(B) = P(B|A) * P(A) + P(B|not A) * P(not A)")
        try:
            prob_a = get_float_input("Enter P(A) (prior probability): ", min_value=0, max_value=1)
            prob_b_given_a = get_float_input("Enter P(B|A): ", min_value=0, max_value=1)
            prob_not_a = 1.0 - prob_a
            if prob_not_a > 1e-9: 
                 prob_b_given_not_a = get_float_input("Enter P(B|not A): ", min_value=0, max_value=1)
            else:
                 prob_b_given_not_a = 0 
                 print("Note: P(not A) is effectively 0.")

            result = basic_probability.bayes_theorem(prob_a, prob_b_given_a, prob_b_given_not_a)
            print(f"Posterior Probability P(A|B) = {result:.4f}")
        except ValueError as e:
            print(f"Error: {e}")
        except ZeroDivisionError:
             print("Error: The calculated probability P(B) is zero, cannot apply Bayes' Theorem.")


    elif choice == '5':
        print("\n--- Expected Value E[X] = sum(x * P(x)) ---")
        try:
            values_str = input("Enter values (comma-separated): ").split(',')
            probs_str = input("Enter probabilities (comma-separated, sum to 1): ").split(',')

            if len(values_str) != len(probs_str):
                print("Error: Number of values and probabilities must match.")
                return

            values = [float(v.strip()) for v in values_str]
            probabilities = [float(p.strip()) for p in probs_str]

            if abs(sum(probabilities) - 1.0) > 1e-6:
                print("Error: Probabilities must sum to 1.")
                return
            
            ev = basic_probability.expected_value(values, probabilities)
            print(f"Expected Value E[X] = {ev:.4f}")
            
            var = basic_probability.variance(values, probabilities)
            print(f"Variance Var(X) = {var:.4f}")

        except ValueError:
            print("Error: Invalid input. Please enter numbers.")
        except Exception as e:
            print(f"An error occurred: {e}")


    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def automata_menu():
    options = [
        "Deterministic Finite Automata (DFA)",
        "Nondeterministic Finite Automata (NFA)",
        "Regular Expressions to NFA",
        "Simulate Automaton Step-by-Step"
    ]
    choice = display_menu("Automata Theory Calculator", options)
    if choice == '1':
        dfa_interactive_menu()
    elif choice == '2':
        nfa_interactive_menu()
    elif choice == '3':
        regex_to_nfa_interactive()
    elif choice == '4':
        simulate_automaton_interactive()
    elif choice == '0':
        return
    else:
        print("Invalid choice.")

def dfa_interactive_menu():
    print("\n--- Deterministic Finite Automata (DFA) ---")
    
    states_str = input("Enter states (comma-separated, e.g., q0,q1,q2): ")
    alphabet_str = input("Enter alphabet symbols (comma-separated, e.g., 0,1): ")
    start_state = input("Enter start state (e.g., q0): ").strip()
    accept_states_str = input("Enter accept states (comma-separated, e.g., q2): ")
    
    states = {s.strip() for s in states_str.split(',')}
    alphabet = {a.strip() for a in alphabet_str.split(',')}
    accept_states = {s.strip() for s in accept_states_str.split(',')}
    
    transitions = {}
    print("Enter transitions (one per line: current_state,symbol,next_state). Empty line to finish:")
    while True:
        trans_str = input().strip()
        if not trans_str:
            break
        try:
            curr, sym, next_s = [x.strip() for x in trans_str.split(',')]
            if curr not in states or sym not in alphabet or next_s not in states:
                print("Invalid state or symbol in transition. Try again.")
                continue
            transitions[(curr, sym)] = next_s
        except ValueError:
            print("Invalid format. Use current_state,symbol,next_state. Try again.")
            
    try:
        dfa = ConcreteDFA(states, alphabet, transitions, start_state, accept_states)
        print("\nDFA created successfully:")
        print(dfa)
        
        while True:
            test_string = input("\nEnter a string to test (or empty to finish): ").strip()
            if not test_string:
                break
            try:
                accepted, trace = dfa.process_string(test_string)
                print(f"String '{test_string}': {'Accepted' if accepted else 'Rejected'}")
                print(f"Trace: {' -> '.join(trace)}")
            except ValueError as e:
                print(f"Error processing string: {e}")
                
    except Exception as e:
        print(f"Error creating DFA: {e}")

def nfa_interactive_menu():
    print("\n--- Nondeterministic Finite Automata (NFA) ---")
    states_str = input("Enter states (comma-separated, e.g., q0,q1,q2): ")
    alphabet_str = input("Enter alphabet symbols (comma-separated, e.g., 0,1,epsilon): ")
    start_state = input("Enter start state (e.g., q0): ").strip()
    accept_states_str = input("Enter accept states (comma-separated, e.g., q2): ")

    states = {s.strip() for s in states_str.split(',')}
    alphabet = {a.strip() for a in alphabet_str.split(',')}
    accept_states = {s.strip() for s in accept_states_str.split(',')}

    transitions = {}
    print("Enter transitions (one per line: current_state,symbol,next_state1;next_state2;...). Empty line to finish:")
    print("Use 'epsilon' for epsilon transitions.")
    while True:
        trans_str = input().strip()
        if not trans_str:
            break
        try:
            parts = [x.strip() for x in trans_str.split(',')]
            if len(parts) != 3:
                raise ValueError("Invalid format. Use current_state,symbol,next_states_list")
            
            curr, sym, next_states_list_str = parts
            next_states_set = {ns.strip() for ns in next_states_list_str.split(';')}

            if curr not in states: raise ValueError(f"Current state '{curr}' not in defined states.")
            if sym != 'epsilon' and sym not in alphabet: raise ValueError(f"Symbol '{sym}' not in defined alphabet.")
            for ns in next_states_set:
                if ns not in states: raise ValueError(f"Next state '{ns}' not in defined states.")

            if (curr, sym) not in transitions:
                transitions[(curr, sym)] = set()
            transitions[(curr, sym)].update(next_states_set)

        except ValueError as e:
            print(f"Invalid transition input: {e}. Try again.")
            
    try:
        nfa = NFA(states, alphabet, transitions, start_state, accept_states)
        print("\nNFA created successfully:")
        print(nfa)
        
        while True:
            test_string = input("\nEnter a string to test (or empty to finish): ").strip()
            if not test_string:
                break
            try:
                accepted, final_states = nfa.process_string(test_string)
                print(f"String '{test_string}': {'Accepted' if accepted else 'Rejected'}")
                if accepted:
                    print(f"Possible final states reached: {final_states}")
            except ValueError as e:
                print(f"Error processing string: {e}")
                
    except Exception as e:
        print(f"Error creating NFA: {e}")


def regex_to_nfa_interactive():
    print("\n--- Regular Expression to NFA ---")
    regex_str = input("Enter a regular expression (e.g., (a|b)*c): ").strip()
    try:
        converter = RegexToNFA(regex_str)
        nfa = converter.convert()
        print("\nNFA generated from regex:")
        print(nfa)
        print("\nNFA details (dictionary format):")
        print(nfa.to_dict())
    except Exception as e:
        print(f"Error converting regex to NFA: {e}")

def simulate_automaton_interactive():
    print("\n--- Simulate Automaton Step-by-Step ---")
    
    automaton_type = input("Enter automaton type (dfa/nfa): ").lower()
    
    if automaton_type == 'dfa':
        print("Define DFA:")
        states_str = input("States (comma-separated): ")
        alphabet_str = input("Alphabet (comma-separated): ")
        start_state = input("Start state: ").strip()
        accept_states_str = input("Accept states (comma-separated): ")
        states = {s.strip() for s in states_str.split(',')}
        alphabet = {a.strip() for a in alphabet_str.split(',')}
        accept_states = {s.strip() for s in accept_states_str.split(',')}
        transitions_dict = {}
        print("Transitions (current,symbol,next). Empty line to finish:")
        while True:
            line = input().strip()
            if not line: break
            c, s, n = [x.strip() for x in line.split(',')]
            transitions_dict[(c,s)] = n
        automaton = ConcreteDFA(states, alphabet, transitions_dict, start_state, accept_states)
    elif automaton_type == 'nfa':
        print("Define NFA:")
        states_str = input("States (comma-separated): ")
        alphabet_str = input("Alphabet (comma-separated, use 'epsilon' for ε): ")
        start_state = input("Start state: ").strip()
        accept_states_str = input("Accept states (comma-separated): ")
        states = {s.strip() for s in states_str.split(',')}
        alphabet = {a.strip() for a in alphabet_str.split(',')}
        accept_states = {s.strip() for s in accept_states_str.split(',')}
        transitions_dict = {}
        print("Transitions (current,symbol,next1;next2;...). Empty line to finish:")
        while True:
            line = input().strip()
            if not line: break
            c, s, ns_str = [x.strip() for x in line.split(',')]
            ns_set = {ns.strip() for ns in ns_str.split(';')}
            if (c,s) not in transitions_dict: transitions_dict[(c,s)] = set()
            transitions_dict[(c,s)].update(ns_set)
        automaton = NFA(states, alphabet, transitions_dict, start_state, accept_states)
    else:
        print("Invalid automaton type.")
        return

    input_string = input("Enter input string for simulation: ").strip()
    simulator = AutomatonSimulator(automaton, input_string)
    
    print("\nSimulation started. Initial state:", simulator.get_state())
    while not simulator.finished:
        action = input("Action (f=forward, b=back, r=reset, q=quit): ").lower()
        if action == 'f':
            simulator.step_forward()
        elif action == 'b':
            simulator.step_back()
        elif action == 'r':
            simulator.reset()
        elif action == 'q':
            break
        else:
            print("Invalid action.")
            continue
        print("Current state:", simulator.get_state())
        
    print("\nSimulation finished.")
    print("Accepted:", simulator.accepted)
    print("Final states:", simulator.current_states)
    print("Trace:", simulator.trace)


def main():
    while True:
        print("\n=== Discrete Math Calculator ===")
        print("1. Logic")
        print("2. Set Theory")
        print("3. Functions and Relations")
        print("4. Combinatorics")
        print("5. Graph Theory")
        print("6. Number Theory")
        print("7. Algebraic Structures")
        print("8. Discrete Probability")
        print("9. Automata Theory")
        print("0. Exit")
        choice = input("Choose a topic: ")
        
        if choice == '1':
            logic_menu()
        elif choice == '2':
            set_theory_menu()
        elif choice == '3':
            functions_relations_menu()
        elif choice == '4':
            combinatorics_menu()
        elif choice == '5':
            graph_theory_menu()
        elif choice == '6':
            number_theory_menu()
        elif choice == '7':
            algebraic_structures_menu()
        elif choice == '8':
            discrete_probability_menu()
        elif choice == '9':
            automata_menu()
        elif choice == '0':
            print("Goodbye!")
            sys.exit(0)
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
