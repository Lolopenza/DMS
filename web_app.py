import sys
import os
import re
import numpy as np
try:
    from scipy import sparse
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

current_script_path = os.path.abspath(__file__)
project_package_dir = os.path.dirname(current_script_path) # .../discrete_math_calculator
project_root_dir = os.path.dirname(project_package_dir) # .../v0.0.27 (directory containing the package)

if project_root_dir not in sys.path:
    sys.path.insert(0, project_root_dir)

from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, session
import os
import sys
# Core imports - математическая логика
from core.automata.dfa import DFA
from core.automata.nfa import NFA
from core.automata.regex import RegexToNFA
from core.automata.simulation import AutomatonSimulator
from core.automata.validation import validate_input
from core.automata.pda import PDA
from core.automata.tm import TuringMachine
from core.set_theory.set_operations import get_power_set, set_complement, cartesian_product, set_union, set_intersection, set_difference, set_symmetric_difference, is_subset, is_proper_subset
from core.combinatorics.basic import factorial, permutations, combinations
from core.combinatorics.advanced import pigeonhole_principle, catalan_number, stirling_numbers_second_kind
from core.discrete_probability.basic_probability import probability, conditional_probability, bayes_theorem
from core.discrete_probability.random_variables import pmf_binomial, pmf_poisson, pmf_geometric
from core.logic.propositional import generate_truth_table_from_string, check_logical_equivalence_from_strings
from core.number_theory.divisibility import gcd, lcm, divisors, prime_factorization, euler_totient, chinese_remainder_theorem
from core.number_theory.cryptography import modular_exponentiation, modular_inverse, rsa_encrypt, rsa_decrypt, generate_rsa_keys
from core.graph_theory.basics import Graph
from core.graph_theory.algorithms import depth_first_search, breadth_first_search, find_connected_components, has_cycle, has_cycle_undirected, kruskal_mst, dijkstra

# AI imports
from ai.chatbot import get_chatbot_service

# Utils
import jsonschema
from flask_cors import CORS
from marshmallow import Schema, fields, ValidationError
from dotenv import load_dotenv
load_dotenv()  # Load .env file immediately
import io
from PIL import Image
import easyocr
from utils import mcp_client
from utils.config import MCP_ENABLED, MCP_SERVER_URL
import base64
import logging
from functools import wraps

# Matplotlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.stats import binom, poisson, geom, hypergeom, nbinom
import sympy as sp

# Flask app with new paths
app = Flask(__name__, 
            static_url_path='/static', 
            static_folder='web/static',
            template_folder='web/templates')
app.secret_key = os.environ.get('FLASK_SECRET_KEY') or os.urandom(32)
CORS(app)

app.config['DEBUG'] = True

if not os.environ.get("OPENROUTER_API_KEY"):
    print("[ERROR] OPENROUTER_API_KEY is not set. Please set it as an environment variable.")
else:
    print("[INFO] OPENROUTER_API_KEY is set.")

api_key = os.environ.get("OPENROUTER_API_KEY", "")
if api_key:
    print(f"[INFO] Using OpenRouter API key: {api_key[:4]}...{api_key[-4:]}")
else:
    print("[WARNING] OpenRouter API key is missing. Chatbot will not work.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/graph-theory')
def graph_theory():
    return render_template('graph_theory.html')

@app.route('/combinatorics')
def combinatorics():
    return render_template('combinatorics.html')

@app.route('/probability')
def probability():
    return render_template('probability.html')

@app.route('/automata')
def automata():
    return render_template('automata.html')

@app.route('/set-theory')
def set_theory():
    return render_template('set_theory.html')

@app.route('/number-theory')
def number_theory():
    return render_template('number_theory.html')

@app.route('/logic')
def logic():
    return render_template('logic.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('web/static', path)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('web/static/js', filename)

@app.route('/api/status')
def api_status():
    return jsonify({'status': 'online','version': '1.0.0','features': ['Graph Theory','Combinatorics','Probability','Automata','Set Theory','Number Theory','Logic']})

class DFASchema(Schema):
    states = fields.List(fields.Str(), required=True)
    alphabet = fields.List(fields.Str(), required=True)
    transitions = fields.Dict(keys=fields.Str(), values=fields.Dict(keys=fields.Str(), values=fields.Str()), required=True)
    start_state = fields.Str(required=True)
    accept_states = fields.List(fields.Str(), required=True)

class NFASchema(Schema):
    states = fields.List(fields.Str(), required=True)
    alphabet = fields.List(fields.Str(), required=True)
    transitions = fields.Dict(keys=fields.Str(), values=fields.Dict(keys=fields.Str(), values=fields.List(fields.Str())), required=True)
    start_state = fields.Str(required=True)
    accept_states = fields.List(fields.Str(), required=True)

class RegexToNFASchema(Schema):
    regex = fields.Str(required=True)

class SetOperationsSchema(Schema):
    operation = fields.Str(required=True)
    setA = fields.List(fields.Raw(), required=False)
    setB = fields.List(fields.Raw(), required=False)
    setC = fields.List(fields.Raw(), required=False)
    universe = fields.List(fields.Raw(), required=False)

class SetTheorySchema(Schema):
    operation = fields.Str(required=True)
    setA = fields.List(fields.Raw(), required=False)
    setB = fields.List(fields.Raw(), required=False)
    universe = fields.List(fields.Raw(), required=False)

class CombinatoricsSchema(Schema):
    operation = fields.Str(required=True)
    n = fields.Integer(required=False)
    r = fields.Integer(required=False)
    pigeons = fields.Integer(required=False)
    holes = fields.Integer(required=False)
    k = fields.Integer(required=False)

class ProbabilitySchema(Schema):
    operation = fields.Str(required=True)
    favorable = fields.Integer(required=False)
    total = fields.Integer(required=False)
    joint = fields.Float(required=False)
    condition = fields.Float(required=False)
    prior = fields.Float(required=False)
    true_pos = fields.Float(required=False)
    false_pos = fields.Float(required=False)
    n = fields.Integer(required=False)
    p = fields.Float(required=False)
    k = fields.Integer(required=False)
    lambda_ = fields.Float(required=False, data_key='lambda')

class LogicSchema(Schema):
    operation = fields.Str(required=True, validate=lambda op: op in ['truth_table', 'equivalence'])
    variables = fields.List(fields.Str(), required=True)
    formula = fields.Str()
    formula1 = fields.Str()
    formula2 = fields.Str()
    def validate(self, data, **kwargs):
        operation = data.get('operation')
        if operation == 'truth_table' and not data.get('formula'):
            raise ValidationError({'formula': ['Formula is required for truth_table operation']})
        if operation == 'equivalence':
            errors = {}
            if not data.get('formula1'):
                errors['formula1'] = ['Formula1 is required for equivalence operation']
            if not data.get('formula2'):
                errors['formula2'] = ['Formula2 is required for equivalence operation']
            if errors:
                raise ValidationError(errors)
        return data

class NumberTheorySchema(Schema):
    operation = fields.Str(required=True)
    a = fields.Integer(required=False)
    b = fields.Integer(required=False)
    n = fields.Integer(required=False)
    base = fields.Integer(required=False)
    exponent = fields.Integer(required=False)
    modulus = fields.Integer(required=False)
    m = fields.Integer(required=False)
    bits = fields.Integer(required=False)
    message = fields.Integer(required=False)
    e = fields.Integer(required=False)
    d = fields.Integer(required=False)
    ciphertext = fields.Integer(required=False)
    remainders = fields.List(fields.Integer(), required=False)
    moduli = fields.List(fields.Integer(), required=False)

class AutomataSchema(Schema):
    operation = fields.Str(required=True)
    dfa = fields.Dict(required=False)
    nfa = fields.Dict(required=False)
    regex = fields.Str(required=False)
    input_string = fields.Str(required=False)

class GraphTheorySchema(Schema):
    operation = fields.Str(required=True)
    graph = fields.Dict(required=False)
    start = fields.Str(required=False)
    end = fields.Str(required=False)

class PDASchema(Schema):
    states = fields.List(fields.Str(), required=True)
    input_alphabet = fields.List(fields.Str(), required=True)
    stack_alphabet = fields.List(fields.Str(), required=True)
    transitions = fields.Dict(keys=fields.Str(), values=fields.List(fields.Str()), required=True)
    start_state = fields.Str(required=True)
    accept_states = fields.List(fields.Str(), required=True)
    start_stack = fields.Str(required=True)

class TMSchema(Schema):
    states = fields.List(fields.Str(), required=True)
    tape_alphabet = fields.List(fields.Str(), required=True)
    blank_symbol = fields.Str(required=True)
    transitions = fields.Dict(keys=fields.Str(), values=fields.List(fields.Str()), required=True)
    start_state = fields.Str(required=True)
    accept_states = fields.List(fields.Str(), required=True)
    reject_states = fields.List(fields.Str(), required=True)

@app.errorhandler(ValidationError)
def handle_marshmallow_error(e):
    return jsonify({'error': e.messages}), 400

def try_number(x):
    try:
        if isinstance(x, str) and x.strip() == '':
            return x
        n = float(x)
        if n.is_integer():
            return int(n)
        return n
    except Exception:
        return x

def parse_set_elements(s):
    return set(try_number(x) for x in s)

def normalize_formula(formula):
    s = formula
    s = re.sub(r'\s+', ' ', s)
    s = s.replace('&', ' and ')
    s = s.replace('|', ' or ')
    s = s.replace('~', 'not ')
    s = re.sub(r'([A-Za-z0-9_])\s*->\s*([A-Za-z0-9_])', r'implies(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*<->\s*([A-Za-z0-9_])', r'iff(\1, \2)', s)
    s = re.sub(r'([A-Za-z0-9_])\s*\^\s*([A-Za-z0-9_])', r'(\1 != \2)', s)
    return s

def _extract_formula_variables(formula):
    import re
    return set(re.findall(r'\b([A-Za-z])\b', formula))

@app.route('/api/logic', methods=['POST'])
def api_logic():
    try:
        data = LogicSchema().load(request.get_json())
        operation = data.get('operation')
        variables = data.get('variables')
        if not variables or not all(isinstance(v, str) and len(v) == 1 and v.isalpha() for v in variables):
            return jsonify({'error': 'Variables must be a non-empty list of single-letter names (e.g., P, Q, R).'}), 400
        if operation == 'truth_table':
            formula = data.get('formula')
            if not formula:
                return jsonify({'error': 'Formula is required for truth table generation.'}), 400
            used_vars = _extract_formula_variables(formula)
            if not used_vars.issubset(set(variables)):
                return jsonify({'error': f'Formula uses variables not listed: {sorted(used_vars - set(variables))}'}), 400
            try:
                norm_formula = normalize_formula(formula)
                truth_table = generate_truth_table_from_string(norm_formula, variables)
                return jsonify({'result': truth_table})
            except Exception as e:
                return jsonify({'error': f'Error generating truth table: {str(e)}'}), 400
        elif operation == 'equivalence':
            formula1 = data.get('formula1')
            formula2 = data.get('formula2')
            if not formula1 or not formula2:
                return jsonify({'error': 'Both formula1 and formula2 are required for equivalence check.'}), 400
            used_vars1 = _extract_formula_variables(formula1)
            used_vars2 = _extract_formula_variables(formula2)
            all_used = used_vars1.union(used_vars2)
            if not all_used.issubset(set(variables)):
                return jsonify({'error': f'Formulas use variables not listed: {sorted(all_used - set(variables))}'}), 400
            try:
                norm_formula1 = normalize_formula(formula1)
                norm_formula2 = normalize_formula(formula2)
                are_equivalent = check_logical_equivalence_from_strings(norm_formula1, norm_formula2, variables)
                return jsonify({'result': are_equivalent})
            except Exception as e:
                return jsonify({'error': f'Error checking equivalence: {str(e)}'}), 400
        return jsonify({'error': f'Unknown operation: {operation}'}), 400
    except ValidationError as ve:
        return jsonify({'error': 'Invalid input: ' + str(ve.messages)}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@app.route('/api/set_operations', methods=['POST'])
def api_set_operations():
    try:
        data = SetOperationsSchema().load(request.get_json())
        operation = data.get('operation')
        for key in ['setA', 'setB', 'setC', 'universe']:
            if key in data and not isinstance(data[key], list):
                return jsonify({'error': f'{key} must be a list'}), 400
        setA = parse_set_elements(data.get('setA', []))
        setB = parse_set_elements(data.get('setB', []))
        setC = parse_set_elements(data.get('setC', []))
        universe = parse_set_elements(data.get('universe', []))
        result = None
        if operation == 'union':
            result = list(set_union(setA, setB))
        elif operation == 'intersection':
            result = list(set_intersection(setA, setB))
        elif operation == 'difference':
            result = list(set_difference(setA, setB))
        elif operation == 'symmetric':
            result = list(set_symmetric_difference(setA, setB))
        elif operation == 'empty':
            result = len(setC) == 0
        elif operation == 'finite':
            result = '...' not in setC
        elif operation == 'infinite':
            result = '...' in setC
        elif operation == 'cardinality':
            result = '∞' if '...' in setC else len(setC)
        elif operation == 'subset':
            result = is_subset(setA, setB)
        elif operation == 'superset':
            result = is_subset(setB, setA)
        elif operation == 'disjoint':
            result = setA.isdisjoint(setB)
        elif operation == 'equal':
            result = setA == setB
        elif operation == 'power':
            result = [list(fs) for fs in get_power_set(setC)]
        elif operation == 'complement':
            if not universe:
                return jsonify({'error': 'Universe must be provided for complement operation'}), 400
            result = list(set_complement(universe, setC))
        elif operation == 'cartesian':
            result = [list(pair) for pair in cartesian_product(setA, setB)]
        else:
            return jsonify({'error': 'Unknown operation'}), 400
        return jsonify({'result': result})
    except ValidationError as ve:
        return jsonify({'error': ve.messages}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_named_sets():
    if 'named_sets' not in session:
        session['named_sets'] = {}
    return session['named_sets']

def get_named_universes():
    if 'named_universes' not in session:
        session['named_universes'] = {}
    return session['named_universes']

def parse_advanced_set(input_str, named_sets=None, named_universes=None):
    steps = []
    input_str = input_str.strip()
    named_sets = named_sets or {}
    named_universes = named_universes or {}
    if input_str in named_sets:
        steps.append(f"Loaded named set: {input_str}")
        return {'set': set(parse_advanced_set(named_sets[input_str], named_sets, named_universes)['set']), 'type': 'named', 'steps': steps}
    if input_str in named_universes:
        steps.append(f"Loaded named universe: {input_str}")
        return {'set': set(parse_advanced_set(named_universes[input_str], named_sets, named_universes)['set']), 'type': 'named_universe', 'steps': steps}
    inf_map = {'N': 'ℕ', 'Z': 'ℤ', 'Q': 'ℚ', 'R': 'ℝ', 'C': 'ℂ'}
    if input_str in inf_map or input_str in inf_map.values():
        steps.append(f"Recognized infinite set: {input_str}")
        return {'set': inf_map.get(input_str, input_str), 'type': 'infinite', 'steps': steps}
    if input_str.startswith('{') and '|' in input_str:
        try:
            body = input_str.strip('{} ')
            var, cond = body.split('|', 1)
            var = var.strip()
            cond = cond.strip()
            if 'in' in cond and '..' in cond:
                rng = cond.split('in')[1].strip()
                start, end = map(int, rng.split('..'))
                s = set(range(start, end+1))
                steps.append(f"Parsed set-builder range: {start}..{end}")
                return {'set': s, 'type': 'range', 'steps': steps}
            steps.append(f"Parsed set-builder notation, but condition not evaluated: {cond}")
            return {'set': set(), 'type': 'set-builder', 'steps': steps}
        except Exception as e:
            steps.append(f"Failed to parse set-builder notation: {e}")
            return {'set': set(), 'type': 'error', 'steps': steps}
    if '..' in input_str:
        try:
            start, end = map(int, input_str.split('..'))
            s = set(range(start, end+1))
            steps.append(f"Parsed range: {start}..{end}")
            return {'set': s, 'type': 'range', 'steps': steps}
        except Exception as e:
            steps.append(f"Failed to parse range: {e}")
            return {'set': set(), 'type': 'error', 'steps': steps}
    if input_str.startswith('{') and '(' in input_str:
        try:
            items = input_str.strip('{} ').split('),')
            fuzzy = {}
            for item in items:
                item = item.strip('() {}')
                if not item: continue
                el, mu = item.split(',')
                fuzzy[el.strip()] = float(mu.strip())
            steps.append(f"Parsed fuzzy set: {fuzzy}")
            return {'set': fuzzy, 'type': 'fuzzy', 'steps': steps}
        except Exception as e:
            steps.append(f"Failed to parse fuzzy set: {e}")
            return {'set': {}, 'type': 'error', 'steps': steps}
    if input_str.count(',') > 0:
        items = [x.strip() for x in input_str.strip('{} ').split(',') if x.strip()]
        from collections import Counter
        multiset = Counter(items)
        steps.append(f"Parsed multiset: {multiset}")
        return {'set': multiset, 'type': 'multiset', 'steps': steps}
    items = [x.strip() for x in re.split(r'[ ,]+', input_str) if x.strip()]
    s = set()
    for x in items:
        try:
            v = int(x)
            s.add(v)
        except Exception:
            try:
                v = float(x)
                s.add(v)
            except Exception:
                s.add(x)
    steps.append(f"Parsed as plain set: {s}")
    return {'set': s, 'type': 'plain', 'steps': steps}

def parse_set_with_steps(input_val, named_sets=None, named_universes=None):
    if isinstance(input_val, str):
        return parse_advanced_set(input_val, named_sets, named_universes)
    elif isinstance(input_val, list):
        s = set()
        steps = []
        for x in input_val:
            if isinstance(x, str):
                res = parse_advanced_set(x, named_sets, named_universes)
                s.update(res['set'] if isinstance(res['set'], set) else [])
                steps.extend(res['steps'])
            else:
                s.add(x)
        steps.append(f"Parsed list as set: {s}")
        return {'set': s, 'type': 'plain', 'steps': steps}
    else:
        return {'set': set(), 'type': 'error', 'steps': ['Input not recognized as set']}

@app.route('/api/set_theory', methods=['POST'])
def api_set_theory():
    try:
        data = request.get_json()
        action = data.get('action')
        named_sets = get_named_sets()
        named_universes = get_named_universes()
        # Named sets/universes CRUD
        if action == 'list_named_sets':
            return jsonify({'named_sets': named_sets})
        if action == 'list_named_universes':
            return jsonify({'named_universes': named_universes})
        if action == 'save_named_set':
            name = data.get('name')
            value = data.get('value')
            if not name or value is None:
                return jsonify({'error': 'Name and value required'}), 400
            named_sets[name] = value
            session.modified = True
            return jsonify({'success': True, 'named_sets': named_sets})
        if action == 'delete_named_set':
            name = data.get('name')
            if name in named_sets:
                del named_sets[name]
                session.modified = True
                return jsonify({'success': True, 'named_sets': named_sets})
            return jsonify({'error': 'Set not found'}), 404
        if action == 'save_named_universe':
            name = data.get('name')
            value = data.get('value')
            if not name or value is None:
                return jsonify({'error': 'Name and value required'}), 400
            named_universes[name] = value
            session.modified = True
            return jsonify({'success': True, 'named_universes': named_universes})
        if action == 'delete_named_universe':
            name = data.get('name')
            if name in named_universes:
                del named_universes[name]
                session.modified = True
                return jsonify({'success': True, 'named_universes': named_universes})
            return jsonify({'error': 'Universe not found'}), 404
        # Batch
        if action == 'batch':
            operations = data.get('operations', [])
            results = []
            for op in operations:
                try:
                    payload = {k: op[k] for k in op if k != 'action'}
                    payload['action'] = op['action']
                    with app.test_request_context(json=payload):
                        resp = api_set_theory()
                        if hasattr(resp, 'get_json'):
                            results.append(resp.get_json())
                        else:
                            results.append({'error': 'No result'})
                except Exception as e:
                    results.append({'error': str(e)})
            return jsonify({'results': results})
        # Set operations/properties/relations
        op = data.get('operation')
        setA = parse_set_with_steps(data.get('setA', []), named_sets, named_universes)
        setB = parse_set_with_steps(data.get('setB', []), named_sets, named_universes)
        universe = parse_set_with_steps(data.get('universe', []), named_sets, named_universes)
        steps = []
        result = None
        
        # Helper function to convert Counter to set if needed
        def to_set(s):
            if hasattr(s, 'keys'):  # Counter or dict
                return set(s.keys())
            elif isinstance(s, set):
                return s
            elif isinstance(s, (list, tuple)):
                return set(s)
            return set()
        
        a_set = to_set(setA['set'])
        b_set = to_set(setB['set'])
        u_set = to_set(universe['set'])
        
        if op == 'union':
            result = list(a_set | b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Union: {result}"])
        elif op == 'intersection':
            result = list(a_set & b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Intersection: {result}"])
        elif op == 'difference':
            result = list(a_set - b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Difference: {result}"])
        elif op in ('symmetric', 'symmetric_difference'):
            result = list(a_set ^ b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Symmetric difference: {result}"])
        elif op == 'complement':
            if not u_set:
                return jsonify({'error': 'Universe must be provided for complement operation'}), 400
            result = list(u_set - a_set)
            steps.extend(universe['steps'] + setA['steps'] + [f"Complement: {result}"])
        elif op == 'subset':
            result = a_set.issubset(b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Subset: {result}"])
        elif op == 'superset':
            result = b_set.issubset(a_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Superset: {result}"])
        elif op == 'disjoint':
            result = a_set.isdisjoint(b_set)
            steps.extend(setA['steps'] + setB['steps'] + [f"Disjoint: {result}"])
        elif op == 'equal':
            result = a_set == b_set
            steps.extend(setA['steps'] + setB['steps'] + [f"Equal: {result}"])
        elif op == 'proper_subset':
            result = a_set < b_set
            steps.extend(setA['steps'] + setB['steps'] + [f"Proper subset: {result}"])
        elif op in ('power', 'power_set'):
            from core.set_theory.set_operations import get_power_set
            result = [list(s) for s in get_power_set(a_set)]
            steps.extend(setA['steps'] + [f"Power set: {result}"])
        elif op in ('cartesian', 'cartesian_product'):
            from core.set_theory.set_operations import cartesian_product
            result = [list(pair) for pair in cartesian_product(a_set, b_set)]
            steps.extend(setA['steps'] + setB['steps'] + [f"Cartesian product: {result}"])
        elif op in ('empty', 'finite', 'infinite', 'cardinality'):
            if op == 'empty':
                result = len(a_set) == 0
                steps.extend(setA['steps'] + [f"Empty: {result}"])
            elif op == 'finite':
                result = '...' not in a_set
                steps.extend(setA['steps'] + [f"Finite: {result}"])
            elif op == 'infinite':
                result = '...' in a_set
                steps.extend(setA['steps'] + [f"Infinite: {result}"])
            elif op == 'cardinality':
                result = '∞' if '...' in a_set else len(a_set)
                steps.extend(setA['steps'] + [f"Cardinality: {result}"])
        elif op in ('relation_reflexive','relation_symmetric','relation_antisymmetric','relation_transitive','relation_inverse','relation_composition','relation_reflexive_closure','relation_symmetric_closure','relation_transitive_closure'):
            rel = set(tuple(pair) for pair in data.get('relation', []))
            univ = set(universe['set'])
            def is_reflexive(rel, univ):
                for x in univ:
                    if (x, x) not in rel:
                        return False
                return True
            def is_symmetric(rel):
                for (a, b) in rel:
                    if (b, a) not in rel:
                        return False
                return True
            def is_antisymmetric(rel):
                for (a, b) in rel:
                    if a != b and (b, a) in rel:
                        return False
                return True
            def is_transitive(rel):
                for (a, b) in rel:
                    for (c, d) in rel:
                        if b == c and (a, d) not in rel:
                            return False
                return True
            def relation_inverse(rel):
                return set((b, a) for (a, b) in rel)
            def relation_composition(r1, r2):
                return set((a, d) for (a, b) in r1 for (c, d) in r2 if b == c)
            def reflexive_closure(rel, univ):
                return rel | set((x, x) for x in univ)
            def symmetric_closure(rel):
                return rel | set((b, a) for (a, b) in rel)
            def transitive_closure(rel):
                closure = set(rel)
                added = True
                while added:
                    added = False
                    new_pairs = set()
                    for (a, b) in closure:
                        for (c, d) in closure:
                            if b == c and (a, d) not in closure:
                                new_pairs.add((a, d))
                    if new_pairs:
                        closure |= new_pairs
                        added = True
                return closure
            if op == 'relation_reflexive':
                result = is_reflexive(rel, univ)
                steps.append(f"Checked reflexivity: {result}")
            elif op == 'relation_symmetric':
                result = is_symmetric(rel)
                steps.append(f"Checked symmetry: {result}")
            elif op == 'relation_antisymmetric':
                result = is_antisymmetric(rel)
                steps.append(f"Checked antisymmetry: {result}")
            elif op == 'relation_transitive':
                result = is_transitive(rel)
                steps.append(f"Checked transitivity: {result}")
            elif op == 'relation_inverse':
                result = list(relation_inverse(rel))
                steps.append(f"Computed inverse: {result}")
            elif op == 'relation_composition':
                r2 = set(tuple(pair) for pair in data.get('relation2', []))
                result = list(relation_composition(rel, r2))
                steps.append(f"Computed composition: {result}")
            elif op == 'relation_reflexive_closure':
                result = list(reflexive_closure(rel, univ))
                steps.append(f"Reflexive closure: {result}")
            elif op == 'relation_symmetric_closure':
                result = list(symmetric_closure(rel))
                steps.append(f"Symmetric closure: {result}")
            elif op == 'relation_transitive_closure':
                result = list(transitive_closure(rel))
                steps.append(f"Transitive closure: {result}")
        else:
            return jsonify({'error': 'Unknown operation'}), 400
        return jsonify({'result': result, 'steps': steps})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata', methods=['POST'])
def api_automata():
    try:
        data = AutomataSchema().load(request.get_json())
        operation = data.get('operation')
        result = None
        if operation == 'dfa_process':
            validate_input(data['dfa'], 'dfa')
            dfa = DFA(**data['dfa'])
            input_string = data.get('input_string', '')
            accepted, trace = dfa.process_string(input_string)
            result = {'accepted': accepted, 'trace': trace}
        elif operation == 'nfa_process':
            validate_input(data['nfa'], 'nfa')
            nfa = NFA(**data['nfa'])
            input_string = data.get('input_string', '')
            accepted, final_states = nfa.process_string(input_string)
            result = {'accepted': accepted, 'final_states': list(final_states)}
        elif operation == 'regex_to_nfa':
            regex = data.get('regex', '')
            converter = RegexToNFA(regex)
            nfa = converter.convert()
            result = nfa.to_dict()
        elif operation == 'dfa_minimize':
            validate_input(data['dfa'], 'dfa')
            dfa = DFA(**data['dfa'])
            minimized = dfa.minimize()
            result = minimized.to_dict()
        elif operation == 'nfa_to_dfa':
            validate_input(data['nfa'], 'nfa')
            nfa = NFA(**data['nfa'])
            dfa = nfa.to_dfa()
            result = dfa.to_dict()
        elif operation == 'simulate_step':
            automaton_type = data.get('automaton_type')
            automaton_data = data.get('automaton_data')
            input_string = data.get('input_string', '')
            action = data.get('action', 'forward')
            current_sim_state = data.get('current_sim_state')
            validate_input(automaton_data, automaton_type)
            if automaton_type == 'dfa':
                automaton = DFA.from_dict(automaton_data)
            elif automaton_type == 'nfa':
                automaton = NFA.from_dict(automaton_data)
            else:
                return jsonify({'error': 'Invalid automaton type'}), 400
            simulator = AutomatonSimulator(automaton, input_string)
            if current_sim_state:
                simulator.set_state(current_sim_state)
            if action == 'forward':
                sim_accepted, sim_states = simulator.step_forward()
            elif action == 'back':
                sim_accepted, sim_states = simulator.step_back()
            elif action == 'reset':
                sim_accepted, sim_states = simulator.reset()
            else:
                return jsonify({'error': 'Invalid simulation action'}), 400
            result = {
                'state': simulator.get_state(),
                'accepted': sim_accepted,
                'current_states': list(sim_states)
            }
        else:
            return jsonify({'error': 'Unknown operation'}), 400
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/graph_theory', methods=['POST'])
def api_graph_theory():
    try:
        data = GraphTheorySchema().load(request.get_json())
        operation = data.get('operation')
        graph_data = data.get('graph')
        graph = Graph(directed=graph_data.get('directed', False))
        for v in graph_data.get('vertices', []):
            graph.add_vertex(v)
        for edge in graph_data.get('edges', []):
            graph.add_edge(edge['u'], edge['v'], edge.get('weight'))
        result = None
        if operation == 'dfs':
            start_node = data.get('start_node')
            result = depth_first_search(graph, start_node)
        elif operation == 'bfs':
            start_node = data.get('start_node')
            result = breadth_first_search(graph, start_node)
        elif operation == 'connected_components':
            result = find_connected_components(graph)
        elif operation == 'has_cycle':
            if graph.directed:
                result = has_cycle(graph)
            else:
                result = has_cycle_undirected(graph)
        elif operation == 'kruskal':
            mst_edges, total_weight = kruskal_mst(graph)
            result = {'edges': mst_edges, 'total_weight': total_weight}
        elif operation == 'dijkstra':
            start_node = data.get('start_node')
            distances, predecessors = dijkstra(graph, start_node)
            result = {'distances': distances, 'predecessors': predecessors}
        else:
            return jsonify({'error': 'Unknown operation'}), 400
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/image_to_text', methods=['POST'])
def api_image_to_text():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided.'}), 400
    image_file = request.files['image']
    try:
        img = Image.open(image_file.stream).convert('RGB')
        img_np = np.array(img)
        reader = easyocr.Reader(['en'], gpu=False)
        result = reader.readtext(img_np, detail=0)
        text = '\n'.join(result)
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': f'OCR failed: {str(e)}'}), 500

def safe_string(val):
    import json
    if val is None:
        return ''
    if isinstance(val, (dict, list)):
        return json.dumps(val, indent=2, ensure_ascii=False)
    return str(val)

@app.route('/adjacency_matrix')
def adjacency_matrix():
    return render_template('adjacency_matrix.html')

@app.route('/api/adjacency_matrix/power', methods=['POST'])
def adjacency_matrix_power():
    try:
        data = request.json
        matrix = data.get('matrix')
        power = data.get('power')
        if matrix is None or power is None:
            return jsonify({'result': None, 'error': 'Missing matrix or power'}), 400
        result = local_matrix_power(matrix, power)
        return jsonify({'result': result, 'error': None})
    except Exception as e:
        return jsonify({'result': None, 'error': str(e)}), 500

@app.route('/api/graph/info', methods=['POST'])
def graph_info():
    data = request.json
    graph_data = data.get('graph')
    result = local_graph_info(graph_data)
    return jsonify({'result': result, 'source': 'local'})

def local_matrix_power(matrix, power):
    arr = np.array(matrix, dtype=float)
    result = np.linalg.matrix_power(arr, int(power))
    return result.tolist()

def local_graph_info(graph_data):
    matrix = np.array(graph_data['matrix'], dtype=float)
    n = matrix.shape[0]
    directed = graph_data.get('directed', False)
    weighted = graph_data.get('weighted', False)
    degrees = matrix.sum(axis=1) if directed else matrix.sum(axis=0) + matrix.sum(axis=1)
    num_edges = int(matrix.sum()) if directed else int(matrix.sum() // 2)
    info = {
        'num_vertices': n,
        'num_edges': num_edges,
        'degrees': degrees.tolist(),
        'directed': directed,
        'weighted': weighted
    }
    return info

@app.route('/api/adjacency_matrix/degree', methods=['POST'])
def adjacency_matrix_degree():
    try:
        data = request.json
        matrix = data.get('matrix')
        node = data.get('node')
        directed = bool(data.get('directed', False))
        if matrix is None or node is None:
            return jsonify({'result': None, 'error': 'Missing matrix or node'}), 400
        result = local_adjacency_matrix_degree(matrix, node, directed)
        return jsonify({'result': result, 'error': None})
    except Exception as e:
        return jsonify({'result': None, 'error': str(e)}), 500

@app.route('/api/adjacency_matrix/neighbors', methods=['POST'])
def adjacency_matrix_neighbors():
    try:
        data = request.json
        matrix = data.get('matrix')
        node = data.get('node')
        directed = bool(data.get('directed', False))
        if matrix is None or node is None:
            return jsonify({'result': None, 'error': 'Missing matrix or node'}), 400
        result = local_adjacency_matrix_neighbors(matrix, node, directed)
        return jsonify({'result': result, 'error': None})
    except Exception as e:
        return jsonify({'result': None, 'error': str(e)}), 500

def local_adjacency_matrix_degree(matrix, node, directed):
    import numpy as np
    arr = np.array(matrix, dtype=int)
    if not (0 <= node < arr.shape[0]):
        raise ValueError('Invalid node index')
    if directed:
        in_deg = int(arr[:, node].sum())
        out_deg = int(arr[node, :].sum())
        return {'in_degree': in_deg, 'out_degree': out_deg, 'total': in_deg + out_deg}
    else:
        deg = int(arr[node, :].sum() + arr[:, node].sum())
        return {'degree': deg}

def local_adjacency_matrix_neighbors(matrix, node, directed):
    import numpy as np
    arr = np.array(matrix, dtype=int)
    if not (0 <= node < arr.shape[0]):
        raise ValueError('Invalid node index')
    if directed:
        out_neighbors = [int(j) for j in range(arr.shape[1]) if arr[node, j] != 0]
        in_neighbors = [int(i) for i in range(arr.shape[0]) if arr[i, node] != 0]
        return {'out_neighbors': out_neighbors, 'in_neighbors': in_neighbors}
    else:
        neighbors = sorted(set([int(j) for j in range(arr.shape[1]) if arr[node, j] != 0] + [int(i) for i in range(arr.shape[0]) if arr[i, node] != 0]))
        return {'neighbors': neighbors}

@app.route('/api/adjacency_matrix/to_adjacency_list', methods=['POST'])
def adjacency_matrix_to_adjacency_list():
    data = request.json
    matrix = data.get('matrix')
    if matrix is None:
        return jsonify({'error': 'Missing matrix'}), 400
    arr = np.array(matrix)
    n = arr.shape[0]
    adj_list = {}
    for i in range(n):
        adj_list[str(i)] = [int(j) for j in range(n) if arr[i, j] != 0]
    return jsonify({'result': adj_list})

@app.route('/api/adjacency_matrix/to_edge_list', methods=['POST'])
def adjacency_matrix_to_edge_list():
    data = request.json
    matrix = data.get('matrix')
    if matrix is None:
        return jsonify({'error': 'Missing matrix'}), 400
    arr = np.array(matrix)
    n = arr.shape[0]
    edge_list = []
    for i in range(n):
        for j in range(n):
            if arr[i, j] != 0:
                edge_list.append([int(i), int(j), float(arr[i, j])])
    return jsonify({'result': edge_list})

@app.route('/api/adjacency_matrix/validate', methods=['POST'])
def adjacency_matrix_validate():
    data = request.json
    matrix = data.get('matrix')
    if matrix is None:
        return jsonify({'error': 'Missing matrix'}), 400
    arr = np.array(matrix)
    square = arr.shape[0] == arr.shape[1]
    symmetric = square and np.allclose(arr, arr.T)
    return jsonify({'result': {'square': square, 'symmetric': symmetric, 'error': None}})

@app.route('/api/adjacency_matrix/attributes', methods=['POST'])
def adjacency_matrix_attributes():
    data = request.json
    matrix = data.get('matrix')
    attributes = data.get('attributes')
    if matrix is None or attributes is None:
        return jsonify({'error': 'Missing matrix or attributes'}), 400
    # For now, just echo back
    return jsonify({'result': {'matrix': matrix, 'attributes': attributes}})

@app.route('/api/adjacency_matrix/batch_analysis', methods=['POST'])
def adjacency_matrix_batch_analysis():
    data = request.json
    matrix = data.get('matrix')
    directed = bool(data.get('directed', False))
    if matrix is None:
        return jsonify({'error': 'Missing matrix'}), 400
    arr = np.array(matrix)
    n = arr.shape[0]
    use_sparse = HAS_SCIPY and n > 100
    if use_sparse:
        arr_sparse = sparse.csr_matrix(arr)
    results = []
    for i in range(n):
        if use_sparse:
            row = arr_sparse.getrow(i).toarray().ravel()
            col = arr_sparse.getcol(i).toarray().ravel()
        else:
            row = arr[i, :]
            col = arr[:, i]
        if directed:
            in_deg = int(col.sum())
            out_deg = int(row.sum())
            out_neighbors = [int(j) for j in range(n) if row[j] != 0]
            in_neighbors = [int(j) for j in range(n) if col[j] != 0]
            results.append({'node': i, 'in_degree': in_deg, 'out_degree': out_deg, 'total': in_deg+out_deg, 'in_neighbors': in_neighbors, 'out_neighbors': out_neighbors})
        else:
            deg = int(row.sum() + col.sum())
            neighbors = sorted(set([int(j) for j in range(n) if row[j] != 0] + [int(j) for j in range(n) if col[j] != 0]))
            results.append({'node': i, 'degree': deg, 'neighbors': neighbors})
    return jsonify({'result': results})

@app.route('/api/probability', methods=['POST'])
def api_probability():
    try:
        data = request.get_json()
        op = data.get('operation')
        if op == 'simple':
            favorable = int(data.get('favorable'))
            total = int(data.get('total'))
            if total <= 0 or favorable < 0 or favorable > total:
                return jsonify({'error': 'Check input values.'}), 400
            result = favorable / total
            steps = f"P = favorable / total = {favorable} / {total} = {result}"
            return jsonify({'result': result, 'steps': steps})
        elif op == 'conditional':
            joint = float(data.get('joint'))
            condition = float(data.get('condition'))
            if condition <= 0 or joint < 0 or joint > condition:
                return jsonify({'error': 'Check input values.'}), 400
            result = joint / condition
            steps = f"P(A|B) = P(A and B) / P(B) = {joint} / {condition} = {result}"
            return jsonify({'result': result, 'steps': steps})
        elif op == 'bayes':
            prior = float(data.get('prior'))
            true_pos = float(data.get('true_pos'))
            false_pos = float(data.get('false_pos'))
            denominator = (true_pos * prior) + (false_pos * (1 - prior))
            if denominator == 0:
                return jsonify({'error': 'Denominator cannot be zero'}), 400
            result = (true_pos * prior) / denominator
            steps = f"P(A|B) = (TP * Prior) / (TP * Prior + FP * (1 - Prior)) = ({true_pos} * {prior}) / ({true_pos} * {prior} + {false_pos} * {1-prior}) = {result}"
            return jsonify({'result': result, 'steps': steps})
        elif op == 'binomial_pmf':
            n = int(data.get('n'))
            p = float(data.get('p'))
            k = int(data.get('k'))
            comb = sp.binomial(n, k)
            prob = comb * (p**k) * ((1-p)**(n-k))
            steps = f"P(X={k}) = C({n},{k}) * {p}^{k} * (1-{p})^{n-k} = {comb} * {p**k} * {(1-p)**(n-k)} = {prob}"
            return jsonify({'result': float(prob), 'steps': steps})
        elif op == 'poisson_pmf':
            lam = float(data.get('lambda'))
            k = int(data.get('k'))
            from scipy.stats import poisson
            prob = poisson.pmf(k, lam)
            steps = f"P(X={k}) = e^(-{lam}) * {lam}^{k} / {k}! = {prob}"
            return jsonify({'result': float(prob), 'steps': steps})
        elif op == 'geometric_pmf':
            p = float(data.get('p'))
            k = int(data.get('k'))
            from scipy.stats import geom
            prob = geom.pmf(k, p)
            steps = f"P(X={k}) = (1-p)^{k-1} * p = (1-{p})^{k-1} * {p} = {prob}"
            return jsonify({'result': float(prob), 'steps': steps})
        else:
            return jsonify({'error': 'Unknown or unsupported probability operation'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/combinatorics', methods=['POST'])
def api_combinatorics():
    try:
        data = CombinatoricsSchema().load(request.get_json())
        operation = data.get('operation')
        result = None
        
        if operation == 'factorial':
            n = data.get('n')
            if n is None:
                return jsonify({'error': 'n is required for factorial operation'}), 400
            result = factorial(n)
        elif operation == 'permutation':
            n = data.get('n')
            r = data.get('r')
            if n is None or r is None:
                return jsonify({'error': 'n and r are required for permutation operation'}), 400
            result = permutations(n, r)
        elif operation == 'combination':
            n = data.get('n')
            r = data.get('r')
            if n is None or r is None:
                return jsonify({'error': 'n and r are required for combination operation'}), 400
            result = combinations(n, r)
        elif operation == 'pigeonhole':
            pigeons = data.get('pigeons')
            holes = data.get('holes')
            if pigeons is None or holes is None:
                return jsonify({'error': 'pigeons and holes are required for pigeonhole operation'}), 400
            result = pigeonhole_principle(pigeons, holes)
        elif operation == 'catalan':
            n = data.get('n')
            if n is None:
                return jsonify({'error': 'n is required for catalan operation'}), 400
            result = catalan_number(n)
        elif operation == 'stirling':
            n = data.get('n')
            k = data.get('k')
            if n is None or k is None:
                return jsonify({'error': 'n and k are required for stirling operation'}), 400
            result = stirling_numbers_second_kind(n, k)
        elif operation == 'binomial':
            n = data.get('n')
            k = data.get('k')
            if n is None or k is None:
                return jsonify({'error': 'n and k are required for binomial operation'}), 400
            result = combinations(n, k)
        else:
            return jsonify({'error': f'Unknown operation: {operation}'}), 400
        
        return jsonify({'result': result})
    except ValidationError as ve:
        return jsonify({'error': 'Invalid input: ' + str(ve.messages)}), 400
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@app.route('/api/probability/hypergeometric', methods=['POST'])
def api_probability_hypergeometric():
    try:
        data = request.get_json()
        M = int(data.get('M'))
        n = int(data.get('n'))
        N = int(data.get('N'))
        k = int(data.get('k'))
        result = hypergeom.pmf(k, M, n, N)
        steps = f"Hypergeometric PMF: P(X={k}) = C(n,{k})*C(M-n,N-k)/C(M,N)"
        return jsonify({'result': result, 'steps': steps})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/negative_binomial', methods=['POST'])
def api_probability_negative_binomial():
    try:
        data = request.get_json()
        n = int(data.get('n'))
        p = float(data.get('p'))
        k = int(data.get('k'))
        result = nbinom.pmf(k, n, p)
        steps = f"Negative Binomial PMF: P(X={k}) = nbinom.pmf({k}, n={n}, p={p})"
        return jsonify({'result': result, 'steps': steps})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/joint', methods=['POST'])
def api_probability_joint():
    try:
        data = request.get_json()
        probs = data.get('probs')
        if not (isinstance(probs, list) and all(0 <= float(p) <= 1 for p in probs)):
            return jsonify({'error': 'Invalid probabilities'}), 400
        result = 1.0
        for p in probs:
            result *= float(p)
        steps = f"Joint probability (independent): product of all probabilities"
        return jsonify({'result': result, 'steps': steps})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/custom_pmf', methods=['POST'])
def api_probability_custom_pmf():
    try:
        data = request.get_json()
        values = data.get('values')
        probs = data.get('probs')
        if not (isinstance(values, list) and isinstance(probs, list) and len(values) == len(probs)):
            return jsonify({'error': 'Invalid custom PMF'}), 400
        pmf = dict(zip(values, probs))
        mean = sum(float(v)*float(p) for v,p in zip(values,probs))
        var = sum((float(v)-mean)**2*float(p) for v,p in zip(values,probs))
        steps = f"Mean = sum(v*p), Variance = sum((v-mean)^2*p)"
        return jsonify({'pmf': pmf, 'mean': mean, 'variance': var, 'steps': steps})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/step_by_step', methods=['POST'])
def api_probability_step_by_step():
    try:
        data = request.get_json()
        operation = data.get('operation')
        params = data.get('params', {})
        # Example for binomial
        if operation == 'binomial_pmf':
            n = int(params.get('n'))
            p = float(params.get('p'))
            k = int(params.get('k'))
            comb = sp.binomial(n, k)
            prob = comb * (p**k) * ((1-p)**(n-k))
            steps = f"P(X={k}) = C({n},{k}) * {p}^{k} * (1-{p})^{n-k} = {comb} * {p**k} * {(1-p)**(n-k)} = {prob}"
            return jsonify({'result': float(prob), 'steps': steps})
        # Add more as needed
        return jsonify({'error': 'Unknown operation'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/venn', methods=['POST'])
def api_probability_venn():
    try:
        data = request.get_json()
        sets = data.get('sets')
        # sets: dict of set names to lists of elements
        if not (isinstance(sets, dict) and len(sets) in (2,3)):
            return jsonify({'error': 'Provide 2 or 3 sets'}), 400
        from matplotlib_venn import venn2, venn3
        
        # Convert to sets for operations
        set_objects = {k: set(sets[k]) for k in sets}
        set_keys = list(sets.keys())
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if len(sets) == 2:
            # Create Venn diagram
            v = venn2([set_objects[set_keys[0]], set_objects[set_keys[1]]], 
                      set_labels=(set_keys[0], set_keys[1]), ax=ax)
            
            # Calculate which elements are in each region
            A_only = set_objects[set_keys[0]] - set_objects[set_keys[1]]
            B_only = set_objects[set_keys[1]] - set_objects[set_keys[0]]
            intersection = set_objects[set_keys[0]] & set_objects[set_keys[1]]
            
            # Format elements as strings (limit length for display)
            def format_set_elements(elements, max_display=10):
                elem_list = sorted([str(e) for e in elements])
                if len(elem_list) > max_display:
                    return ', '.join(elem_list[:max_display]) + f'\n... (+{len(elem_list) - max_display} more)'
                return ', '.join(elem_list)
            
            # Update labels to show actual elements
            if v.get_label_by_id('10'):
                v.get_label_by_id('10').set_text(format_set_elements(A_only))
            if v.get_label_by_id('01'):
                v.get_label_by_id('01').set_text(format_set_elements(B_only))
            if v.get_label_by_id('11'):
                v.get_label_by_id('11').set_text(format_set_elements(intersection))
        else:
            # Create Venn diagram for 3 sets
            v = venn3([set_objects[set_keys[0]], set_objects[set_keys[1]], set_objects[set_keys[2]]], 
                     set_labels=(set_keys[0], set_keys[1], set_keys[2]), ax=ax)
            
            # Calculate which elements are in each region
            A = set_objects[set_keys[0]]
            B = set_objects[set_keys[1]]
            C = set_objects[set_keys[2]]
            
            A_only = A - B - C
            B_only = B - A - C
            C_only = C - A - B
            AB_only = (A & B) - C
            AC_only = (A & C) - B
            BC_only = (B & C) - A
            ABC_all = A & B & C
            
            # Format elements as strings
            def format_set_elements(elements, max_display=8):
                elem_list = sorted([str(e) for e in elements])
                if len(elem_list) > max_display:
                    return ', '.join(elem_list[:max_display]) + f'\n... (+{len(elem_list) - max_display})'
                return ', '.join(elem_list)
            
            # Update labels to show actual elements
            # Region IDs: '100'=A only, '010'=B only, '001'=C only, 
            # '110'=AB only, '101'=AC only, '011'=BC only, '111'=ABC all
            if v.get_label_by_id('100'):
                v.get_label_by_id('100').set_text(format_set_elements(A_only))
            if v.get_label_by_id('010'):
                v.get_label_by_id('010').set_text(format_set_elements(B_only))
            if v.get_label_by_id('001'):
                v.get_label_by_id('001').set_text(format_set_elements(C_only))
            if v.get_label_by_id('110'):
                v.get_label_by_id('110').set_text(format_set_elements(AB_only))
            if v.get_label_by_id('101'):
                v.get_label_by_id('101').set_text(format_set_elements(AC_only))
            if v.get_label_by_id('011'):
                v.get_label_by_id('011').set_text(format_set_elements(BC_only))
            if v.get_label_by_id('111'):
                v.get_label_by_id('111').set_text(format_set_elements(ABC_all))
        
        ax.set_title('Venn Diagram', fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')
        return jsonify({'image': img_b64})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/probability/simulate', methods=['POST'])
def api_probability_simulate():
    try:
        data = request.get_json()
        dist = data.get('distribution')
        params = data.get('params', {})
        trials = int(data.get('trials', 1000))
        if dist == 'binomial':
            n = int(params.get('n'))
            p = float(params.get('p'))
            samples = binom.rvs(n, p, size=trials)
        elif dist == 'poisson':
            lam = float(params.get('lambda'))
            samples = poisson.rvs(lam, size=trials)
        elif dist == 'geometric':
            p = float(params.get('p'))
            samples = geom.rvs(p, size=trials)
        elif dist == 'custom':
            values = params.get('values')
            probs = params.get('probs')
            samples = np.random.choice(values, size=trials, p=probs)
        else:
            return jsonify({'error': 'Unknown distribution'}), 400
        # Plot histogram
        fig, ax = plt.subplots()
        ax.hist(samples, bins=range(int(min(samples)), int(max(samples))+2), density=True, alpha=0.7, color='skyblue')
        ax.set_title(f'Simulation ({dist}, {trials} trials)')
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')
        return jsonify({'samples': samples.tolist(), 'image': img_b64})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/pda_process', methods=['POST'])
def api_automata_pda():
    try:
        data = request.get_json()
        pda = PDA(**data['pda'])
        input_string = data.get('input_string', '')
        accepted, trace = pda.process_string(input_string)
        return jsonify({'result': {'accepted': accepted, 'trace': trace}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/tm_process', methods=['POST'])
def api_automata_tm():
    try:
        data = request.get_json()
        tm = TuringMachine(**data['tm'])
        input_string = data.get('input_string', '')
        accepted, tape_trace = tm.process_string(input_string)
        return jsonify({'result': {'accepted': accepted, 'tape_trace': tape_trace}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/regex_to_dfa', methods=['POST'])
def api_automata_regex_to_dfa():
    try:
        data = request.get_json()
        regex = data.get('regex', '')
        converter = RegexToNFA(regex)
        nfa = converter.convert()
        dfa = nfa.to_dfa()
        return jsonify({'result': dfa.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/minimize', methods=['POST'])
def api_automata_minimize():
    try:
        data = request.get_json()
        dfa = DFA(**data['dfa'])
        minimized = dfa.minimize()
        return jsonify({'result': minimized.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/equivalence', methods=['POST'])
def api_automata_equivalence():
    try:
        data = request.get_json()
        dfa1 = DFA(**data['dfa1'])
        dfa2 = DFA(**data['dfa2'])
        equivalent, counterexample = dfa1.is_equivalent_to(dfa2)
        return jsonify({'result': {'equivalent': equivalent, 'counterexample': counterexample}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/operations', methods=['POST'])
def api_automata_operations():
    try:
        data = request.get_json()
        op = data.get('operation')
        dfa1 = DFA(**data['dfa1'])
        dfa2 = DFA(**data['dfa2']) if 'dfa2' in data else None
        if op == 'union':
            result = dfa1.union(dfa2).to_dict()
        elif op == 'intersection':
            result = dfa1.intersection(dfa2).to_dict()
        elif op == 'complement':
            result = dfa1.complement().to_dict()
        elif op == 'difference':
            result = dfa1.difference(dfa2).to_dict()
        else:
            return jsonify({'error': 'Unknown operation'}), 400
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/batch_test', methods=['POST'])
def api_automata_batch_test():
    try:
        data = request.get_json()
        automaton_type = data.get('type')
        automaton_data = data.get('automaton')
        strings = data.get('strings', [])
        if automaton_type == 'dfa':
            automaton = DFA(**automaton_data)
        elif automaton_type == 'nfa':
            automaton = NFA(**automaton_data)
        else:
            return jsonify({'error': 'Unsupported automaton type'}), 400
        results = []
        for s in strings:
            accepted = automaton.process_string(s)[0] if hasattr(automaton, 'process_string') else False
            results.append({'string': s, 'accepted': accepted})
        return jsonify({'result': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/automata/import_export', methods=['POST'])
def api_automata_import_export():
    try:
        data = request.get_json()
        # Just echo back for now
        return jsonify({'result': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    """Chatbot API endpoint - uses AI service"""
    try:
        data = request.get_json()
        messages = data.get('messages')
        if not messages or not isinstance(messages, list):
            return jsonify({'error': 'Missing or invalid messages'}), 400
        
        chatbot_service = get_chatbot_service()
        result = chatbot_service.chat(messages)
        
        if 'error' in result:
            status_code = 500
            if '401' in result['error']:
                status_code = 401
            elif '402' in result['error']:
                status_code = 402
            return jsonify(result), status_code
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

@app.route('/api/number_theory', methods=['POST'])
def api_number_theory():
    try:
        data = request.get_json()
        op = data.get('operation')
        from core.number_theory.divisibility import gcd, lcm, divisors, prime_factorization, euler_totient
        from core.number_theory.cryptography import modular_exponentiation, modular_inverse, generate_rsa_keys, rsa_encrypt, rsa_decrypt
        if op == 'gcd':
            a = int(data.get('a'))
            b = int(data.get('b'))
            return jsonify({'result': gcd(a, b)})
        elif op == 'lcm':
            a = int(data.get('a'))
            b = int(data.get('b'))
            return jsonify({'result': lcm(a, b)})
        elif op == 'divisors':
            n = int(data.get('n'))
            return jsonify({'result': divisors(n)})
        elif op == 'factorize':
            n = int(data.get('n'))
            return jsonify({'result': prime_factorization(n)})
        elif op == 'totient':
            n = int(data.get('n'))
            return jsonify({'result': euler_totient(n)})
        elif op == 'mod_exp':
            base = int(data.get('base'))
            exponent = int(data.get('exponent'))
            modulus = int(data.get('modulus'))
            return jsonify({'result': modular_exponentiation(base, exponent, modulus)})
        elif op == 'mod_inv':
            a = int(data.get('a'))
            m = int(data.get('m'))
            return jsonify({'result': modular_inverse(a, m)})
        elif op == 'crt':
            remainders = data.get('remainders')
            moduli = data.get('moduli')
            if not (isinstance(remainders, list) and isinstance(moduli, list) and len(remainders) == len(moduli)):
                return jsonify({'error': 'Invalid input for CRT'}), 400
            from sympy.ntheory.modular import solve_congruence
            try:
                pairs = [(int(r), int(m)) for r, m in zip(remainders, moduli)]
                x, mod = solve_congruence(*pairs)
                return jsonify({'result': int(x)})
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        elif op == 'rsa_generate':
            bits = int(data.get('bits', 16))
            pub, priv = generate_rsa_keys(bits)
            return jsonify({'result': {'public': pub, 'private': priv}})
        elif op == 'rsa_encrypt':
            message = int(data.get('message'))
            e = int(data.get('e'))
            n = int(data.get('n'))
            return jsonify({'result': rsa_encrypt(message, (n, e))})
        elif op == 'rsa_decrypt':
            ciphertext = int(data.get('ciphertext'))
            d = int(data.get('d'))
            n = int(data.get('n'))
            return jsonify({'result': rsa_decrypt(ciphertext, (n, d))})
        else:
            return jsonify({'error': 'Unknown or unsupported number theory operation'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("\n===== Discrete Math Calculator =====")
    print("Server started at: http://127.0.0.1:5000")
    print("Press Ctrl+C to stop the server")
    load_dotenv()
    app.run(debug=True)
