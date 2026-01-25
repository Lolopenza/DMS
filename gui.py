import sys

from number_theory.divisibility import gcd, lcm, is_prime, prime_factorization, extended_gcd 
from set_theory.set_operations import (set_union, set_intersection, set_difference,
                                     set_symmetric_difference, get_power_set,
                                     cartesian_product) 
from utils.input_helpers import format_set 
from logic.propositional import generate_truth_table 
from sympy.parsing.sympy_parser import parse_expr
from sympy import symbols, SympifyError
from combinatorics.basic import factorial, permutations, combinations
from combinatorics.advanced import pigeonhole_principle 
from graph_theory.basics import Graph
from graph_theory.algorithms import depth_first_search, breadth_first_search, kruskal_mst, dijkstra 
from discrete_probability.basic_probability import simple_probability, conditional_probability, bayes_theorem, expected_value, variance
from automata.dfa import DFA 
from automata.nfa import NFA 


try:
    from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                                QPushButton, QLabel, QLineEdit, QTextEdit, QTabWidget,
                                QMessageBox, QComboBox, QSpinBox, QFormLayout, QGroupBox,
                                QCheckBox, QGridLayout, QScrollArea) 
    from PyQt5.QtCore import Qt 
    has_pyqt = True
except ImportError:
    has_pyqt = False
    class QMainWindow: pass 
    class QApplication: pass
    class QWidget: pass
    

if has_pyqt:
    class CalculatorGUI(QMainWindow):
        def __init__(self):
            super().__init__()
            self.setWindowTitle("Discrete Math Calculator")
            self.setGeometry(100, 100, 800, 700) 

            self.central_widget = QWidget()
            self.setCentralWidget(self.central_widget)
            self.layout = QVBoxLayout(self.central_widget)

            self.tab_widget = QTabWidget()
            self.layout.addWidget(self.tab_widget)

            self.number_theory_output_area = QTextEdit()
            self.number_theory_output_area.setReadOnly(True)
            self.set_output_area = QTextEdit() 
            self.set_output_area.setReadOnly(True)
            self.logic_output_area = QTextEdit()
            self.logic_output_area.setReadOnly(True)
            self.logic_output_area.setFontFamily("Courier New")
            self.graph_output_area = QTextEdit()
            self.graph_output_area.setReadOnly(True)
            self.graph_output_area.setFontFamily("Courier New")
            self.automata_output_area = QTextEdit()
            self.automata_output_area.setReadOnly(True)
            self.automata_output_area.setFontFamily("Courier New")


            self._create_tabs()

        def _create_tabs(self):
            self.tabs = {}
            sections = {
                "Number Theory": self._create_number_theory_tab,
                "Set Theory": self._create_set_theory_tab,
                "Logic": self.setup_logic_tab,
                "Combinatorics": self._create_combinatorics_tab,
                "Graph Theory": self.setup_graph_tab,
                "Probability": self._create_probability_tab,
                "Automata": self.setup_automata_tab
            }

            for section_name, setup_func in sections.items():
                tab_content_widget = QWidget() 
                tab_attr_name = section_name.lower().replace(" ", "_") + "_tab_content"
                setattr(self, tab_attr_name, tab_content_widget)

                setup_func(tab_content_widget) 

                scroll_area = QScrollArea()
                scroll_area.setWidgetResizable(True)
                scroll_area.setWidget(tab_content_widget)
                
                self.tab_widget.addTab(scroll_area, section_name)
                self.tabs[section_name] = scroll_area 

        def _create_placeholder_tab(self, name):
            tab = QWidget()
            layout = QVBoxLayout(tab)
            label = QLabel(f"Content for {name} goes here.")
            layout.addWidget(label)
            layout.addStretch() 
            return tab

        def _create_number_theory_tab(self, tab_widget):
            layout = QVBoxLayout(tab_widget)

            basic_group = QGroupBox("Basic Operations")
            basic_layout = QFormLayout()

            self.nt_num1_input = QLineEdit()
            self.nt_num1_input.setPlaceholderText("Enter first integer (a)")
            self.nt_num1_input.setToolTip("First integer input for GCD, LCM, and Extended GCD")
            basic_layout.addRow("Number 1 (a):", self.nt_num1_input)

            self.nt_num2_input = QLineEdit()
            self.nt_num2_input.setPlaceholderText("Enter second integer (b)")
            self.nt_num2_input.setToolTip("Second integer input for GCD, LCM, and Extended GCD")
            basic_layout.addRow("Number 2 (b):", self.nt_num2_input)

            basic_buttons_layout = QHBoxLayout()
            gcd_button = QPushButton("GCD")
            gcd_button.setToolTip("Calculate the Greatest Common Divisor of a and b")
            gcd_button.clicked.connect(self.handle_gcd)
            basic_buttons_layout.addWidget(gcd_button)

            lcm_button = QPushButton("LCM")
            lcm_button.setToolTip("Calculate the Least Common Multiple of a and b")
            lcm_button.clicked.connect(self.handle_lcm)
            basic_buttons_layout.addWidget(lcm_button)

            ext_gcd_button = QPushButton("Extended GCD") 
            ext_gcd_button.setToolTip("Find g = gcd(a, b) and integers x, y such that ax + by = g")
            ext_gcd_button.clicked.connect(self.handle_extended_gcd) 
            basic_buttons_layout.addWidget(ext_gcd_button)

            basic_layout.addRow(basic_buttons_layout) 
            basic_group.setLayout(basic_layout)
            layout.addWidget(basic_group)

            prime_group = QGroupBox("Primality and Factorization")
            prime_layout = QFormLayout()

            self.nt_prime_input = QLineEdit()
            self.nt_prime_input.setPlaceholderText("Enter an integer > 1")
            self.nt_prime_input.setToolTip("Integer input for Primality Test and Prime Factorization")
            prime_layout.addRow("Number:", self.nt_prime_input)

            prime_buttons_layout = QHBoxLayout()
            prime_test_button = QPushButton("Primality Test")
            prime_test_button.setToolTip("Check if the number is prime")
            prime_test_button.clicked.connect(self.handle_primality_test)
            prime_buttons_layout.addWidget(prime_test_button)

            prime_factor_button = QPushButton("Prime Factorization")
            prime_factor_button.setToolTip("Find the prime factors of the number")
            prime_factor_button.clicked.connect(self.handle_prime_factorization)
            prime_buttons_layout.addWidget(prime_factor_button)

            prime_layout.addRow(prime_buttons_layout)
            prime_group.setLayout(prime_layout)
            layout.addWidget(prime_group)

            layout.addWidget(QLabel("Output:"))
            layout.addWidget(self.number_theory_output_area)
            layout.addStretch()

        def _create_set_theory_tab(self, tab_widget):
            main_layout = QVBoxLayout(tab_widget)

            input_group = QGroupBox("Set Inputs")
            input_layout = QFormLayout()
            self.st_set_a_input = QLineEdit()
            self.st_set_a_input.setPlaceholderText("Enter elements for Set A (comma-separated, e.g., 1, 2, 3)")
            self.st_set_b_input = QLineEdit()
            self.st_set_b_input.setPlaceholderText("Enter elements for Set B (comma-separated, e.g., 3, 4, 5)")
            input_layout.addRow("Set A:", self.st_set_a_input)
            input_layout.addRow("Set B:", self.st_set_b_input)
            input_group.setLayout(input_layout)
            main_layout.addWidget(input_group)

            set_ops_group = QGroupBox("Set Operations")
            set_ops_layout = QGridLayout()

            union_button = QPushButton("Union (A ∪ B)")
            union_button.clicked.connect(self.handle_set_union)
            set_ops_layout.addWidget(union_button, 0, 0)

            intersection_button = QPushButton("Intersection (A ∩ B)")
            intersection_button.clicked.connect(self.handle_set_intersection)
            set_ops_layout.addWidget(intersection_button, 0, 1)

            diff_ab_button = QPushButton("Difference (A - B)")
            diff_ab_button.clicked.connect(self.handle_set_difference_ab)
            set_ops_layout.addWidget(diff_ab_button, 1, 0)

            diff_ba_button = QPushButton("Difference (B - A)")
            diff_ba_button.clicked.connect(self.handle_set_difference_ba)
            set_ops_layout.addWidget(diff_ba_button, 1, 1)

            sym_diff_button = QPushButton("Symmetric Difference (A Δ B)")
            sym_diff_button.clicked.connect(self.handle_set_symmetric_difference)
            set_ops_layout.addWidget(sym_diff_button, 2, 0)

            cartesian_prod_button = QPushButton("Cartesian Product (A x B)")
            cartesian_prod_button.clicked.connect(self.handle_cartesian_product)
            set_ops_layout.addWidget(cartesian_prod_button, 2, 1)

            power_set_a_button = QPushButton("Power Set P(A)")
            power_set_a_button.clicked.connect(self.handle_power_set_a)
            set_ops_layout.addWidget(power_set_a_button, 3, 0)

            power_set_b_button = QPushButton("Power Set P(B)")
            power_set_b_button.clicked.connect(self.handle_power_set_b)
            set_ops_layout.addWidget(power_set_b_button, 3, 1)

            set_ops_group.setLayout(set_ops_layout)
            main_layout.addWidget(set_ops_group)

            main_layout.addWidget(QLabel("Output:")) 
            main_layout.addWidget(self.set_output_area) 
            main_layout.addStretch()

        def _create_combinatorics_tab(self, tab_widget):
            main_layout = QVBoxLayout(tab_widget)

            fact_group = QGroupBox("Factorial (n!)")
            fact_layout = QFormLayout()
            self.cmb_fact_n_input = QSpinBox()
            self.cmb_fact_n_input.setRange(0, 100) 
            self.cmb_fact_result_label = QLabel("Result: -")
            fact_button = QPushButton("Calculate Factorial")
            fact_button.clicked.connect(self._calculate_factorial)
            fact_layout.addRow("n:", self.cmb_fact_n_input)
            fact_layout.addRow(fact_button, self.cmb_fact_result_label)
            fact_group.setLayout(fact_layout)
            main_layout.addWidget(fact_group)

            perm_group = QGroupBox("Permutations P(n, r)")
            perm_layout = QFormLayout()
            self.cmb_perm_n_input = QSpinBox()
            self.cmb_perm_n_input.setRange(0, 100)
            self.cmb_perm_r_input = QSpinBox()
            self.cmb_perm_r_input.setRange(0, 100)
            self.cmb_perm_result_label = QLabel("Result: -")
            perm_button = QPushButton("Calculate Permutations")
            perm_button.clicked.connect(self._calculate_permutations)
            perm_layout.addRow("n:", self.cmb_perm_n_input)
            perm_layout.addRow("r:", self.cmb_perm_r_input)
            perm_layout.addRow(perm_button, self.cmb_perm_result_label)
            perm_group.setLayout(perm_layout)
            main_layout.addWidget(perm_group)

            comb_group = QGroupBox("Combinations C(n, r)")
            comb_layout = QFormLayout()
            self.cmb_comb_n_input = QSpinBox()
            self.cmb_comb_n_input.setRange(0, 100)
            self.cmb_comb_r_input = QSpinBox()
            self.cmb_comb_r_input.setRange(0, 100)
            self.cmb_comb_result_label = QLabel("Result: -")
            comb_button = QPushButton("Calculate Combinations")
            comb_button.clicked.connect(self._calculate_combinations)
            comb_layout.addRow("n:", self.cmb_comb_n_input)
            comb_layout.addRow("r:", self.cmb_comb_r_input)
            comb_layout.addRow(comb_button, self.cmb_comb_result_label)
            comb_group.setLayout(comb_layout)
            main_layout.addWidget(comb_group)

            main_layout.addStretch()
            


    def _parse_float_list(self, input_field, field_name="List"):
        text = input_field.text().strip()
        if not text:
            self.show_error_message(f"{field_name} input cannot be empty.")
            return None
        try:
            return [float(x.strip()) for x in text.split(',')]
        except ValueError:
            self.show_error_message(f"Please enter valid numbers separated by commas for {field_name}.")
            return None

    def _create_probability_tab(self, tab_widget):
        main_layout = QVBoxLayout(tab_widget)

        simple_prob_group = QGroupBox("Simple Probability P(E) = |E| / |S|")
        simple_prob_layout = QFormLayout()
        self.prob_favorable_input = QLineEdit("3")
        self.prob_total_input = QLineEdit("10")
        self.prob_simple_result_label = QLabel("Result: -")
        simple_prob_button = QPushButton("Calculate Simple Probability")
        simple_prob_button.clicked.connect(self._calculate_simple_prob)
        simple_prob_layout.addRow("Favorable Outcomes |E|:", self.prob_favorable_input)
        simple_prob_layout.addRow("Total Outcomes |S|:", self.prob_total_input)
        simple_prob_layout.addRow(simple_prob_button, self.prob_simple_result_label)
        simple_prob_group.setLayout(simple_prob_layout)
        main_layout.addWidget(simple_prob_group)

        cond_prob_group = QGroupBox("Conditional Probability P(A|B)")
        cond_prob_layout = QFormLayout()
        self.prob_a_and_b_input = QLineEdit("0.2")
        self.prob_b_input = QLineEdit("0.5")
        self.prob_cond_result_label = QLabel("Result: -")
        cond_prob_button = QPushButton("Calculate P(A|B)")
        cond_prob_button.clicked.connect(self._calculate_conditional_prob)
        cond_prob_layout.addRow("P(A and B):", self.prob_a_and_b_input)
        cond_prob_layout.addRow("P(B):", self.prob_b_input)
        cond_prob_layout.addRow(cond_prob_button, self.prob_cond_result_label)
        cond_prob_group.setLayout(cond_prob_layout)
        main_layout.addWidget(cond_prob_group)

        bayes_group = QGroupBox("Bayes' Theorem P(A|B)")
        bayes_layout = QFormLayout()
        self.prob_b_given_a_input = QLineEdit("0.9")
        self.prob_a_bayes_input = QLineEdit("0.1")
        self.prob_b_bayes_input = QLineEdit("0.3")
        self.prob_bayes_result_label = QLabel("Result: -")
        bayes_button = QPushButton("Calculate P(A|B) using Bayes")
        bayes_button.clicked.connect(self._calculate_bayes)
        bayes_layout.addRow("P(B|A):", self.prob_b_given_a_input)
        bayes_layout.addRow("P(A):", self.prob_a_bayes_input)
        bayes_layout.addRow("P(B):", self.prob_b_bayes_input)
        bayes_layout.addRow(bayes_button, self.prob_bayes_result_label)
        bayes_group.setLayout(bayes_layout)
        main_layout.addWidget(bayes_group)

        ev_var_group = QGroupBox("Expected Value E[X] & Variance Var(X)")
        ev_var_layout = QFormLayout()
        self.prob_values_input = QLineEdit("1, 2, 3, 4")
        self.prob_probs_input = QLineEdit("0.1, 0.3, 0.4, 0.2")
        self.prob_ev_result_label = QLabel("E[X]: -")
        self.prob_var_result_label = QLabel("Var(X): -")
        ev_var_button = QPushButton("Calculate E[X] and Var(X)")
        ev_var_button.clicked.connect(self._calculate_ev_variance)
        ev_var_layout.addRow("Values (comma-sep):", self.prob_values_input)
        ev_var_layout.addRow("Probabilities (comma-sep):", self.prob_probs_input)
        ev_var_layout.addRow(ev_var_button)
        ev_var_layout.addRow(self.prob_ev_result_label)
        ev_var_layout.addRow(self.prob_var_result_label)
        ev_var_group.setLayout(ev_var_layout)
        main_layout.addWidget(ev_var_group)

        main_layout.addStretch()
        

    def _get_float_input(self, input_field, field_name="Value"):
        try:
            val = float(input_field.text())
            return val
        except ValueError:
            self.show_error_message(f"Please enter a valid number for {field_name}.")
            return None

    def _calculate_simple_prob(self):
        try:
            favorable = int(self.prob_favorable_input.text())
            total = int(self.prob_total_input.text())
            if favorable < 0 or total <= 0:
                raise ValueError("Outcomes must be non-negative, total must be positive.")
            if favorable > total:
                raise ValueError("Favorable outcomes cannot exceed total outcomes.")
            result = simple_probability(favorable, total)
            self.prob_simple_result_label.setText(f"Result: {result:.4f}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_conditional_prob(self):
        p_a_and_b = self._get_float_input(self.prob_a_and_b_input, "P(A and B)")
        p_b = self._get_float_input(self.prob_b_input, "P(B)")
        if p_a_and_b is None or p_b is None:
            return
        try:
            result = conditional_probability(p_a_and_b, p_b)
            self.prob_cond_result_label.setText(f"Result: {result:.4f}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_bayes(self):
        p_b_given_a = self._get_float_input(self.prob_b_given_a_input, "P(B|A)")
        p_a = self._get_float_input(self.prob_a_bayes_input, "P(A)")
        p_b = self._get_float_input(self.prob_b_bayes_input, "P(B)")
        if p_b_given_a is None or p_a is None or p_b is None:
            return
        try:
            result = bayes_theorem(p_b_given_a, p_a, p_b)
            self.prob_bayes_result_label.setText(f"Result: {result:.4f}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_ev_variance(self):
        values = self._parse_float_list(self.prob_values_input, "Values")
        probabilities = self._parse_float_list(self.prob_probs_input, "Probabilities")
        if values is None or probabilities is None:
            return

        if len(values) != len(probabilities):
            self.show_error_message("Number of values must match number of probabilities.")
            return

        if not abs(sum(probabilities) - 1.0) < 1e-9:
             self.show_error_message("Probabilities must sum to 1.")
             return

        if not all(0 <= p <= 1 for p in probabilities):
             self.show_error_message("Probabilities must be between 0 and 1.")
             return

        try:
            ev = expected_value(values, probabilities)
            var = variance(values, probabilities)
            self.prob_ev_result_label.setText(f"E[X]: {ev:.4f}")
            self.prob_var_result_label.setText(f"Var(X): {var:.4f}")
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_factorial(self):
        n = self.cmb_fact_n_input.value()
        try:
            result = factorial(n)
            self.cmb_fact_result_label.setText(f"Result: {result}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_permutations(self):
        n = self.cmb_perm_n_input.value()
        r = self.cmb_perm_r_input.value()
        try:
            result = permutations(n, r)
            self.cmb_perm_result_label.setText(f"Result: {result}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_combinations(self):
        n = self.cmb_comb_n_input.value()
        r = self.cmb_comb_r_input.value()
        try:
            result = combinations(n, r)
            self.cmb_comb_result_label.setText(f"Result: {result}")
        except ValueError as e:
            self.show_error_message(str(e))
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _parse_set_input(self, input_field, field_name="Set"):
        text = input_field.text().strip()
        if not text:
            self.show_error_message(f"{field_name} input cannot be empty.")
            return None

        if text.startswith('{') and text.endswith('}'):
            text = text[1:-1]

        elements = [item.strip() for item in text.split(',') if item.strip()]

        try:
            return set(int(e) for e in elements)
        except ValueError:
            try:
                return set(float(e) for e in elements)
            except ValueError:
                return set(elements) 

    def _calculate_set_op_binary(self, operation_func, op_name, formatter=None):
        if formatter is None:
            formatter = self.format_set 
        set_a = self._parse_set_input(self.st_set_a_input, "Set A")
        set_b = self._parse_set_input(self.st_set_b_input, "Set B")
        if set_a is None or set_b is None:
            return
        try:
            result = operation_func(set_a, set_b)
            self.set_output_area.setText(f"{op_name}: {formatter(result)}")
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _calculate_set_op_unary(self, input_field, set_name, operation_func, op_name, formatter=None):
        if formatter is None:
            formatter = self.format_set 
        input_set = self._parse_set_input(input_field, set_name)
        if input_set is None:
            return
        if operation_func == get_power_set and len(input_set) > 10:
            self.show_error_message("Power set calculation limited to sets with <= 10 elements.")
            return
        try:
            result = operation_func(input_set)
            self.set_output_area.setText(f"{op_name}: {formatter(result)}")
        except Exception as e:
            self.show_error_message(f"Calculation error: {e}")

    def _get_two_integers(self, input1_field, input2_field, name1="Number 1", name2="Number 2"):
        try:
            num1 = int(input1_field.text())
            num2 = int(input2_field.text())
            return num1, num2
        except ValueError:
            self.show_error_message(f"Please enter valid integers for {name1} and {name2}.")
            return None, None

    def _get_one_integer(self, input_field, name="Number"):
        try:
            num = int(input_field.text())
            return num
        except ValueError:
            self.show_error_message(f"Please enter a valid integer for {name}.")
            return None

    def handle_gcd(self):
        num1, num2 = self._get_two_integers(self.nt_num1_input, self.nt_num2_input, "Number 1 (a)", "Number 2 (b)")
        if num1 is not None and num2 is not None:
            try:
                result = gcd(num1, num2)
                self.number_theory_output_area.setText(f"GCD({num1}, {num2}) = {result}")
            except Exception as e:
                self.show_error_message(f"Calculation error: {e}")

    def handle_lcm(self):
        num1, num2 = self._get_two_integers(self.nt_num1_input, self.nt_num2_input, "Number 1 (a)", "Number 2 (b)")
        if num1 is not None and num2 is not None:
             if num1 == 0 or num2 == 0:
                 self.show_error_message("LCM is not defined for zero.")
                 self.number_theory_output_area.setText("LCM Result: -")
                 return
             try:
                result = lcm(num1, num2)
                self.number_theory_output_area.setText(f"LCM({num1}, {num2}) = {result}")
             except Exception as e:
                self.show_error_message(f"Calculation error: {e}")

    def handle_primality_test(self):
        num = self._get_one_integer(self.nt_prime_input, "Number")
        if num is not None:
            try:
                result = is_prime(num)
                self.number_theory_output_area.setText(f"Is {num} prime? {result}")
            except Exception as e:
                self.show_error_message(f"Calculation error: {e}")

    def handle_prime_factorization(self):
        num = self._get_one_integer(self.nt_prime_input, "Number") 
        if num is not None:
            if num < 2:
                self.show_error_message("Factorization requires an integer greater than 1.")
                self.number_theory_output_area.setText("Factorization Result: -")
                return
            try:
                result = prime_factorization(num)
                factors_str = " * ".join([f"{p}^{e}" if e > 1 else str(p) for p, e in result.items()])
                self.number_theory_output_area.setText(f"Prime Factorization of {num}: {factors_str}")
            except Exception as e:
                self.show_error_message(f"Calculation error: {e}")

    def handle_extended_gcd(self):
        nums = self._get_two_integers(self.nt_num1_input, self.nt_num2_input, "Number 1 (a)", "Number 2 (b)")
        if nums is None: return 
        a, b = nums

        try:
            g, x, y = extended_gcd(a, b)
            self.number_theory_output_area.setText(f"Extended GCD for a={a}, b={b}:\n" +
                                               f"gcd(a, b) = {g}\n" +
                                               f"x = {x}\n" +
                                               f"y = {y}\n" +
                                               f"Verification: ({a})*({x}) + ({b})*({y}) = {a*x + b*y} (should equal {g})")
        except Exception as e:
            self.show_error_message(f"An error occurred during Extended GCD calculation: {e}")


    def setup_logic_tab(self, tab_widget):
        layout = QVBoxLayout(tab_widget)
        
        truth_table_group = QGroupBox("Propositional Logic - Truth Table")
        truth_table_layout = QFormLayout()

        self.logic_formula_input = QLineEdit()
        self.logic_formula_input.setPlaceholderText("Enter propositional formula (e.g., p & q | ~r)")
        truth_table_layout.addRow("Formula:", self.logic_formula_input)

        generate_truth_table_button = QPushButton("Generate Truth Table")
        generate_truth_table_button.clicked.connect(self.handle_generate_truth_table)
        truth_table_layout.addRow(generate_truth_table_button)

        truth_table_group.setLayout(truth_table_layout)
        layout.addWidget(truth_table_group)

        layout.addWidget(QLabel("Output:"))
        layout.addWidget(self.logic_output_area)
        layout.addStretch() 

    def handle_generate_truth_table(self):
        formula_str = self.logic_formula_input.text().strip()
        if not formula_str:
            self.show_error_message("Please enter a propositional formula.")
            return

        try:
            sympy_formula = formula_str.replace('->', '>>').replace('<->', 'Equivalent').replace('!', '~')

            expr = parse_expr(sympy_formula, transformations='all') 
            variables = sorted([str(s) for s in expr.free_symbols], key=str) 

            headers, table_data = generate_truth_table(formula_str, variables) 

            if not headers or not table_data:
                 self.logic_output_area.setText("Could not generate truth table (maybe no variables or constant expression?).")
                 return

            col_widths = [len(h) for h in headers]
            for row in table_data:
                for i, val in enumerate(row):
                    col_widths[i] = max(col_widths[i], len(str(val)))

            header_str = " | ".join(f"{h:<{col_widths[i]}}" for i, h in enumerate(headers))
            separator = "-+-".join("-" * w for w in col_widths)

            data_str = "\n".join(
                " | ".join(f"{str(val):<{col_widths[i]}}" for i, val in enumerate(row))
                for row in table_data
            )

            output_text = f"{header_str}\n{separator}\n{data_str}"
            self.logic_output_area.setText(output_text)

        except (SympifyError, SyntaxError) as e:
            self.show_error_message(f"Error parsing formula: {e}\n"
                                    "Ensure variables are single letters and use standard operators. "
                                    "Supported: &, |, ~, ->, <-> (or use sympy equivalents like >>, Equivalent)")
        except Exception as e:
            import traceback
            self.show_error_message(f"An error occurred: {e}\n{traceback.format_exc()}") 

    def setup_graph_tab(self, tab_widget):
        layout = QVBoxLayout(tab_widget) 

        input_group = QGroupBox("Graph Definition")
        input_layout = QVBoxLayout()

        self.graph_directed_checkbox = QCheckBox("Directed Graph")
        input_layout.addWidget(self.graph_directed_checkbox)

        input_layout.addWidget(QLabel("Enter Edges (one per line: start,end[,weight]):"))
        self.graph_edges_input = QTextEdit()
        self.graph_edges_input.setPlaceholderText("A,B\nB,C,5\nA,C,10")
        self.graph_edges_input.setAcceptRichText(False)
        self.graph_edges_input.setFixedHeight(150)
        input_layout.addWidget(self.graph_edges_input)

        input_group.setLayout(input_layout)
        layout.addWidget(input_group)

        algo_group = QGroupBox("Graph Algorithms")
        algo_layout = QFormLayout()

        self.graph_start_node_input = QLineEdit()
        self.graph_start_node_input.setPlaceholderText("Enter start node (e.g., A)")
        algo_layout.addRow("Start Node:", self.graph_start_node_input)

        self.graph_end_node_input = QLineEdit()
        self.graph_end_node_input.setPlaceholderText("Enter end node for Dijkstra (e.g., C)")
        algo_layout.addRow("End Node (Dijkstra):", self.graph_end_node_input) 

        dfs_button = QPushButton("Run Depth-First Search (DFS)")
        dfs_button.clicked.connect(self.handle_run_dfs)
        algo_layout.addRow(dfs_button)

        bfs_button = QPushButton("Run Breadth-First Search (BFS)")
        bfs_button.clicked.connect(self.handle_run_bfs)
        algo_layout.addRow(bfs_button)

        mst_button = QPushButton("Find Minimum Spanning Tree (Kruskal)")
        mst_button.clicked.connect(self.handle_run_mst)
        algo_layout.addRow(mst_button)

        dijkstra_button = QPushButton("Find Shortest Path (Dijkstra)") 
        dijkstra_button.clicked.connect(self.handle_run_dijkstra) 
        algo_layout.addRow(dijkstra_button) 

        algo_group.setLayout(algo_layout)
        layout.addWidget(algo_group)

        layout.addWidget(QLabel("Output:"))
        layout.addWidget(self.graph_output_area)
        layout.addStretch() 

    def _parse_graph_input(self):
        is_directed = self.graph_directed_checkbox.isChecked()
        edges_text = self.graph_edges_input.toPlainText().strip()
        graph = Graph(directed=is_directed)
        vertices = set()

        if not edges_text:
            return graph 

        lines = edges_text.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or line.startswith('#'): 
                continue
            parts = [p.strip() for p in line.split(',')] 
            try:
                if len(parts) < 2 or len(parts) > 3:
                    raise ValueError(f"Line {i+1}: Invalid format. Use 'start,end' or 'start,end,weight'.")

                start_node = parts[0]
                end_node = parts[1]
                weight = None

                if not start_node or not end_node:
                     raise ValueError(f"Line {i+1}: Start and end nodes cannot be empty.")

                if len(parts) == 3:
                    try:
                        try:
                            weight = int(parts[2])
                        except ValueError:
                            weight = float(parts[2])
                    except ValueError as e_inner:
                        raise ValueError(f"Line {i+1}: Invalid weight '{parts[2]}'. Must be a number.")

                if start_node not in vertices:
                    graph.add_vertex(start_node)
                    vertices.add(start_node)
                if end_node not in vertices:
                    graph.add_vertex(end_node)
                    vertices.add(end_node)

                graph.add_edge(start_node, end_node, weight)

            except ValueError as e:
                self.show_error_message(f"Error parsing graph input: {e}")
                return None
            except Exception as e:
                self.show_error_message(f"An unexpected error occurred during parsing: {e}")
                return None
        return graph

    def handle_run_dfs(self):
        graph = self._parse_graph_input()
        if graph is None: return
        start_node = self.graph_start_node_input.text().strip()
        if not start_node:
            all_vertices = list(graph.get_vertices())
            if not all_vertices:
                 self.graph_output_area.setText("DFS: Graph is empty.")
                 return
            start_node = all_vertices[0]
            self.show_info_message(f"No start node specified. Starting DFS from '{start_node}'.")
        elif start_node not in graph.get_vertices():
            self.show_error_message(f"Start node '{start_node}' not found in the graph.")
            return
        try:
            visited_nodes = depth_first_search(graph, start_node)
            self.graph_output_area.setText(f"DFS from '{start_node}':\n{', '.join(map(str, visited_nodes))}")
        except Exception as e:
            self.show_error_message(f"Error running DFS: {e}")

    def handle_run_bfs(self):
        graph = self._parse_graph_input()
        if graph is None: return
        start_node = self.graph_start_node_input.text().strip()
        if not start_node:
            all_vertices = list(graph.get_vertices())
            if not all_vertices:
                 self.graph_output_area.setText("BFS: Graph is empty.")
                 return
            start_node = all_vertices[0]
            self.show_info_message(f"No start node specified. Starting BFS from '{start_node}'.")
        elif start_node not in graph.get_vertices():
            self.show_error_message(f"Start node '{start_node}' not found in the graph.")
            return
        try:
            visited_nodes = breadth_first_search(graph, start_node)
            self.graph_output_area.setText(f"BFS from '{start_node}':\n{', '.join(map(str, visited_nodes))}")
        except Exception as e:
            self.show_error_message(f"Error running BFS: {e}")

    def handle_run_mst(self):
        graph = self._parse_graph_input()
        if graph is None: return
        if graph.directed:
            self.show_error_message("MST (Kruskal's) is typically defined for undirected graphs.")
            return
        if not graph.get_edges():
             self.graph_output_area.setText("MST: Graph has no edges. Total weight: 0")
             return
        try:
            for u, v, w in graph.get_edges():
                if w is None:
                    raise ValueError("All edges must have weights for Kruskal's algorithm.")
                

            mst_edges, total_weight = kruskal_mst(graph) 

            output = f"Minimum Spanning Tree (Kruskal):\nTotal Weight: {total_weight}\nEdges:\n"
            output += "\n".join([f"  {str(u)} - {str(v)} (Weight: {w})" for u, v, w in mst_edges])
            self.graph_output_area.setText(output)
        except ValueError as e:
             self.show_error_message(f"Error finding MST: {e}")
        except Exception as e:
            import traceback
            self.show_error_message(f"An error occurred during MST calculation: {e}\n{traceback.format_exc()}")

    def handle_run_dijkstra(self):
        graph = self._parse_graph_input()
        if graph is None: return

        start_node = self.graph_start_node_input.text().strip()
        end_node = self.graph_end_node_input.text().strip() 

        if not start_node:
            self.show_error_message("Please enter a start node for Dijkstra.")
            return

        if start_node not in graph.get_vertices():
            self.show_error_message(f"Start node '{start_node}' not found in the graph.")
            return
        if end_node and end_node not in graph.get_vertices(): 
            self.show_error_message(f"End node '{end_node}' not found in the graph.")
            return

        try:
            for u, v, w in graph.get_edges():
                if w is not None and w < 0:
                    raise ValueError("Dijkstra's algorithm does not support negative edge weights.")

            distances, predecessors = dijkstra(graph, start_node) 

            if not end_node: 
                 output = f"Distances from '{start_node}' (Dijkstra):\n"
                 sorted_nodes = sorted(distances.keys(), key=str)
                 output_lines = []
                 for node in sorted_nodes:
                     dist = distances.get(node, float('inf'))
                     dist_str = str(dist) if dist != float('inf') else 'Infinity'
                     output_lines.append(f"  To {node}: {dist_str}")
                 output += "\n".join(output_lines)

            elif end_node not in distances or distances[end_node] == float('inf'):
                output = f"No path found from '{start_node}' to '{end_node}'."
            else:
                path = []
                curr = end_node
                while curr is not None:
                    path.append(curr)
                    if curr == start_node: break
                    pred = predecessors.get(curr)
                    if pred is not None:
                        curr = pred
                    else: 
                        if curr != start_node: 
                            path = ["Error reconstructing path"]
                        break 
                path.reverse()

                if path and path[0] != "Error reconstructing path":
                    path_str = " -> ".join(map(str, path))
                    output = f"Shortest path from '{start_node}' to '{end_node}':\n"
                    output += f"Distance: {distances[end_node]}\n"
                    output += f"Path: {path_str}"
                else:  
                    output = f"Shortest path from '{start_node}' to '{end_node}':\n"
                    output += f"Distance: {distances[end_node]}\n"
                    output += f"Path: Error reconstructing path (Predecessor data might be incomplete or end node unreachable)"


            self.graph_output_area.setText(output)

        except ValueError as e:
            self.show_error_message(f"Error running Dijkstra: {e}")
        except KeyError as e:
             self.show_error_message(f"Error running Dijkstra: Node {e} might be missing from graph structure or distances/predecessors.")
        except Exception as e:
            import traceback
            self.show_error_message(f"An unexpected error occurred during Dijkstra calculation: {e}\n{traceback.format_exc()}")


    def setup_automata_tab(self, tab_widget):
        layout = QVBoxLayout(tab_widget)

        dfa_group = QGroupBox("Define Deterministic Finite Automaton (DFA)")
        dfa_layout = QFormLayout()

        self.dfa_states_input = QLineEdit()
        self.dfa_states_input.setPlaceholderText("Comma-separated states (e.g., q0,q1,q2)")
        dfa_layout.addRow("States:", self.dfa_states_input)

        self.dfa_alphabet_input = QLineEdit()
        self.dfa_alphabet_input.setPlaceholderText("Comma-separated symbols (e.g., 0,1)")
        dfa_layout.addRow("Alphabet:", self.dfa_alphabet_input)

        self.dfa_start_state_input = QLineEdit()
        self.dfa_start_state_input.setPlaceholderText("Single start state (e.g., q0)")
        dfa_layout.addRow("Start State:", self.dfa_start_state_input)

        self.dfa_accept_states_input = QLineEdit()
        self.dfa_accept_states_input.setPlaceholderText("Comma-separated accept states (e.g., q2)")
        dfa_layout.addRow("Accept States:", self.dfa_accept_states_input)

        dfa_layout.addRow(QLabel("Transitions (one per line: state,symbol,next_state):"))
        self.dfa_transitions_input = QTextEdit()
        self.dfa_transitions_input.setPlaceholderText("q0,0,q1\nq0,1,q0\nq1,0,q1\nq1,1,q2\nq2,0,q2\nq2,1,q2")
        self.dfa_transitions_input.setAcceptRichText(False)
        self.dfa_transitions_input.setFixedHeight(150)
        dfa_layout.addRow(self.dfa_transitions_input)
        
        example_dfa_button = QPushButton("Load Example: Ends with '01'")
        example_dfa_button.clicked.connect(lambda: self.load_example_dfa('ending-01'))
        dfa_layout.addRow(example_dfa_button)

        example_dfa_button_2 = QPushButton("Load Example: Even Zeros")
        example_dfa_button_2.clicked.connect(lambda: self.load_example_dfa('even-zeros'))
        dfa_layout.addRow(example_dfa_button_2)


        dfa_group.setLayout(dfa_layout)
        layout.addWidget(dfa_group)

        test_group = QGroupBox("Test String")
        test_layout = QFormLayout()

        self.dfa_test_string_input = QLineEdit()
        self.dfa_test_string_input.setPlaceholderText("Enter string to test (e.g., 0110)")
        test_layout.addRow("Input String:", self.dfa_test_string_input)

        test_dfa_button = QPushButton("Test String with DFA")
        test_dfa_button.clicked.connect(self.handle_test_dfa_string)
        test_layout.addRow(test_dfa_button)

        test_group.setLayout(test_layout)
        layout.addWidget(test_group)

        layout.addWidget(QLabel("Output:"))
        layout.addWidget(self.automata_output_area) 
        layout.addStretch()

    def _parse_dfa_input(self):
        try:
            states_str = self.dfa_states_input.text().strip()
            alphabet_str = self.dfa_alphabet_input.text().strip()
            start_state = self.dfa_start_state_input.text().strip()
            accept_states_str = self.dfa_accept_states_input.text().strip()
            transitions_text = self.dfa_transitions_input.toPlainText().strip()

            if not states_str or not alphabet_str or not start_state or not accept_states_str or not transitions_text:
                raise ValueError("All DFA definition fields must be filled.")

            states = {s.strip() for s in states_str.split(',') if s.strip()}
            alphabet = {a.strip() for a in alphabet_str.split(',') if a.strip()}
            accept_states = {s.strip() for s in accept_states_str.split(',') if s.strip()}

            if not states: raise ValueError("States list cannot be empty.")
            if not alphabet: raise ValueError("Alphabet list cannot be empty.")
            if not start_state: raise ValueError("Start state cannot be empty.")
            if start_state not in states: raise ValueError(f"Start state '{start_state}' must be in the set of states.")
            if not accept_states: raise ValueError("Accept states list cannot be empty.")
            if not accept_states.issubset(states):
                invalid_accept = accept_states - states
                raise ValueError(f"Accept states {invalid_accept} are not in the defined states.")

            transitions = {}
            lines = transitions_text.split('\n')
            defined_transitions_keys = set()

            for i, line in enumerate(lines):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                parts = [p.strip() for p in line.split(',')]
                if len(parts) != 3:
                    raise ValueError(f"Transition line {i+1}: Invalid format. Use 'state,symbol,next_state'.")
                state, symbol, next_state = parts
                if not state or not symbol or not next_state:
                    raise ValueError(f"Transition line {i+1}: State, symbol, and next_state cannot be empty.")

                if state not in states: raise ValueError(f"Transition line {i+1}: State '{state}' is not in the defined states.")
                if symbol not in alphabet: raise ValueError(f"Transition line {i+1}: Symbol '{symbol}' is not in the defined alphabet.")
                if next_state not in states: raise ValueError(f"Transition line {i+1}: Next state '{next_state}' is not in the defined states.")

                key = (state, symbol)
                if key in transitions:
                    raise ValueError(f"Transition line {i+1}: Non-deterministic transition defined for ({state}, {symbol}). Previous: {transitions[key]}, New: {next_state}")

                transitions[key] = next_state
                defined_transitions_keys.add(key)

            required_transitions_keys = {(s, a) for s in states for a in alphabet}
            missing_transitions = required_transitions_keys - defined_transitions_keys
            if missing_transitions:
                missing_str = ", ".join(f"({s},{a})" for s, a in sorted(list(missing_transitions)))
                raise ValueError(f"DFA is incomplete. Missing transitions for: {missing_str}")
            
            dfa_transitions_for_backend = {}
            for (state,symbol), next_state in transitions.items():
                if state not in dfa_transitions_for_backend:
                    dfa_transitions_for_backend[state] = {}
                dfa_transitions_for_backend[state][symbol] = next_state


            return {
                'states': list(states),
                'alphabet': list(alphabet),
                'transitions': dfa_transitions_for_backend, 
                'start_state': start_state,
                'accept_states': list(accept_states)
            }

        except ValueError as e:
            self.show_error_message(str(e))
            return None
        except Exception as e:
            import traceback
            self.show_error_message(f"An unexpected error occurred: {e}\n{traceback.format_exc()}")
            return None

    def handle_test_dfa_string(self):
        dfa_data = self._parse_dfa_input()
        if not dfa_data:
            return

        test_string = self.dfa_test_string_input.text().strip()
        
        try:
            dfa_instance = DFA(
                states=set(dfa_data['states']),
                alphabet=set(dfa_data['alphabet']),
                transitions=dfa_data['transitions'],
                start_state=dfa_data['start_state'],
                accept_states=set(dfa_data['accept_states'])
            )

            accepted, trace = dfa_instance.process_string(test_string)
            result = "Accepted" if accepted else "Rejected"
            trace_str = " → ".join(trace)
            self.automata_output_area.setText(
                f"String: {test_string}\n"
                f"Result: {result}\n"
                f"Trace: {trace_str}"
            )
        except ValueError as e:
            self.show_error_message(f"Error during DFA processing: {e}")
        except AttributeError as e:
            self.show_error_message(f"Error: Backend DFA issue. {e}")
        except Exception as e:
            import traceback
            self.show_error_message(f"An unexpected error occurred: {e}\n{traceback.format_exc()}")

    def load_example_dfa(self, example_id):
        try:
            if example_id == 'ending-01':
                states = ['q0', 'q1', 'q2']
                alphabet = ['0', '1']
                start_state = 'q0'
                accept_states = ['q2']
                transitions_text = [
                    'q0,0,q1',
                    'q0,1,q0',
                    'q1,0,q1',
                    'q1,1,q2',
                    'q2,0,q1',
                    'q2,1,q0'
                ]
            elif example_id == 'even-zeros':
                states = ['q0', 'q1']
                alphabet = ['0', '1']
                start_state = 'q0'
                accept_states = ['q0']
                transitions_text = [
                    'q0,0,q1',
                    'q0,1,q0',
                    'q1,0,q0',
                    'q1,1,q1'
                ]
            else:
                self.show_error_message("Unknown example DFA")
                return

            self.dfa_states_input.setText(','.join(states))
            self.dfa_alphabet_input.setText(','.join(alphabet))
            self.dfa_start_state_input.setText(start_state)
            self.dfa_accept_states_input.setText(','.join(accept_states))
            self.dfa_transitions_input.setPlainText('\n'.join(transitions_text))
            self.automata_output_area.setText(f"Loaded example: {example_id}")

        except Exception as e:
            import traceback
            self.show_error_message(f"An unexpected error occurred: {e}\n{traceback.format_exc()}")

    def show_error_message(self, message):
        QMessageBox.critical(self, "Error", str(message)) 

    def show_info_message(self, message):
        QMessageBox.information(self, "Information", str(message)) 

    def handle_set_union(self):
        self._calculate_set_op_binary(set_union, "Union (A ∪ B)")

    def handle_set_intersection(self):
        self._calculate_set_op_binary(set_intersection, "Intersection (A ∩ B)")

    def handle_set_difference_ab(self):
        self._calculate_set_op_binary(set_difference, "Difference (A - B)")

    def handle_set_difference_ba(self):
        set_a = self._parse_set_input(self.st_set_a_input, "Set A")
        set_b = self._parse_set_input(self.st_set_b_input, "Set B")
        if set_a is None or set_b is None:
            return
        try: 
            result = set_difference(set_b, set_a) 
            self.set_output_area.setText(f"Difference (B - A): {self.format_set(result)}") 
        except Exception as e: 
            self.show_error_message(f"Calculation error: {e}")

    def handle_set_symmetric_difference(self):
        self._calculate_set_op_binary(set_symmetric_difference, "Symmetric Difference (A Δ B)")

    def handle_cartesian_product(self):
        self._calculate_set_op_binary(cartesian_product, "Cartesian Product (A x B)", formatter=self.format_cartesian) 

    def handle_power_set_a(self):
        self._calculate_set_op_unary(self.st_set_a_input, "Set A", get_power_set, "Power Set P(A)", formatter=self.format_power_set) 

    def handle_power_set_b(self):
        self._calculate_set_op_unary(self.st_set_b_input, "Set B", get_power_set, "Power Set P(B)", formatter=self.format_power_set) 

    @staticmethod
    def format_set(s):
        if not isinstance(s, set): 
             try:
                  s = set(s) 
             except TypeError:
                  return str(s) 

        if not s:
            return "{}"
        try:
            return "{" + ", ".join(sorted(map(str, list(s)))) + "}"
        except TypeError:
            return "{" + ", ".join(map(str, s)) + "}"

    @staticmethod
    def format_power_set(ps):
        if not isinstance(ps, (set, frozenset)):
             try:
                  ps = set(ps) 
             except TypeError:
                  return str(ps) 

        try:
             sorted_subsets = sorted([frozenset(sub) if isinstance(sub, set) else sub for sub in ps],
                                     key=lambda sub: (len(sub), CalculatorGUI.format_set(sub)))
             return "{" + ", ".join(CalculatorGUI.format_set(s) for s in sorted_subsets) + "}"
        except Exception: 
             return "{" + ", ".join(CalculatorGUI.format_set(s) for s in ps) + "}"


    @staticmethod
    def format_cartesian(cp):
        try:
             cp_list = list(cp)
        except TypeError:
             return str(cp) 

        if not cp_list:
             return "{}"

        try:
            sorted_pairs = sorted(cp_list, key=lambda pair: (str(pair[0]), str(pair[1])) if isinstance(pair, tuple) and len(pair)==2 else str(pair))
            formatted_pairs = []
            for p in sorted_pairs:
                 if isinstance(p, tuple) and len(p) == 2:
                      formatted_pairs.append(f"({str(p[0])}, {str(p[1])})")
                 else: 
                      formatted_pairs.append(str(p))
            return "{" + ", ".join(formatted_pairs) + "}"
        except (TypeError, IndexError): 
            return "{" + ", ".join(map(str, cp_list)) + "}"

    def _format_relation_output(self, relation):
        if not isinstance(relation, set):
            return str(relation)
        formatted_pairs = [f"({item[0]}, {item[1]})" for item in relation]
        try:
            formatted_pairs.sort()
        except TypeError:
            pass 
            
        return "{" + ", ".join(formatted_pairs) + "}"

def run_gui():
    if not has_pyqt:
        print("Error: PyQt5 is not installed. Cannot run the GUI.")
        print("Please install it using: pip install PyQt5")
        return

    app = QApplication(sys.argv)
    main_window = CalculatorGUI()
    main_window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    run_gui()
    def handle_set_difference_ab(self):
        self._calculate_set_op_binary(set_difference, "Difference (A - B)")

    def handle_set_difference_ba(self):
        set_a = self._parse_set_input(self.st_set_a_input, "Set A")
        set_b = self._parse_set_input(self.st_set_b_input, "Set B")
        if set_a is None or set_b is None:
            return
        try: # Ensure try block is present
            result = set_difference(set_b, set_a) # Swap order for B - A
            self.set_output_area.setText(f"Difference (B - A): {self.format_set(result)}") # Use static method via self
        except Exception as e: # Add except block
            self.show_error_message(f"Calculation error: {e}")

    def handle_set_symmetric_difference(self):
        self._calculate_set_op_binary(set_symmetric_difference, "Symmetric Difference (A Δ B)")

    def handle_cartesian_product(self):
        # Use the specific formatter for cartesian product
        self._calculate_set_op_binary(cartesian_product, "Cartesian Product (A x B)", formatter=self.format_cartesian) # Use static method via self

    def handle_power_set_a(self):
         # Use the specific formatter for power set
        self._calculate_set_op_unary(self.st_set_a_input, "Set A", get_power_set, "Power Set P(A)", formatter=self.format_power_set) # Use static method via self

    def handle_power_set_b(self):
         # Use the specific formatter for power set
        self._calculate_set_op_unary(self.st_set_b_input, "Set B", get_power_set, "Power Set P(B)", formatter=self.format_power_set) # Use static method via self

    # --- Formatting helpers ---
    @staticmethod
    def format_set(s):
        """Format a set for display."""
        if not isinstance(s, set): # Ensure input is a set
             try:
                  s = set(s) # Attempt conversion if possible
             except TypeError:
                  return str(s) # Fallback to string representation

        if not s:
            return "{}"
        # Attempt to sort if elements are comparable, otherwise just convert to string
        try:
            # Convert all to str first to handle mixed types before sorting
            return "{" + ", ".join(sorted(map(str, list(s)))) + "}"
        except TypeError:
            # Fallback if elements within the set are not comparable even as strings (unlikely)
            return "{" + ", ".join(map(str, s)) + "}"

    @staticmethod
    def format_power_set(ps):
        """Format a power set (set of sets/frozensets) for display."""
        if not isinstance(ps, (set, frozenset)):
             try:
                  ps = set(ps) # Attempt conversion
             except TypeError:
                  return str(ps) # Fallback

        # Sort the subsets by size then by string representation for consistent ordering
        # Use the class's own format_set for formatting subsets
        try:
             # Ensure subsets are hashable (like frozenset) if they came from backend differently
             sorted_subsets = sorted([frozenset(sub) if isinstance(sub, set) else sub for sub in ps],
                                     key=lambda sub: (len(sub), CalculatorGUI.format_set(sub)))
             return "{" + ", ".join(CalculatorGUI.format_set(s) for s in sorted_subsets) + "}"
        except Exception: # Broad catch if sorting/formatting subsets fails
             # Fallback to less ordered representation
             return "{" + ", ".join(CalculatorGUI.format_set(s) for s in ps) + "}"


    @staticmethod
    def format_cartesian(cp):
        """Format a cartesian product result (iterable of tuples) for display."""
        # Convert to list to allow sorting and multiple iterations
        try:
             cp_list = list(cp)
        except TypeError:
             return str(cp) # Fallback if not iterable

        if not cp_list:
             return "{}"

        # Ensure consistent ordering of pairs by sorting based on string representation
        try:
            # Sort based on string representation of each element in the tuple
            sorted_pairs = sorted(cp_list, key=lambda pair: (str(pair[0]), str(pair[1])) if isinstance(pair, tuple) and len(pair)==2 else str(pair))
            # Format each pair/element
            formatted_pairs = []
            for p in sorted_pairs:
                 if isinstance(p, tuple) and len(p) == 2:
                      formatted_pairs.append(f"({str(p[0])}, {str(p[1])})")
                 else: # Handle non-pairs or tuples of different lengths if they occur
                      formatted_pairs.append(str(p))
            return "{" + ", ".join(formatted_pairs) + "}"
        except (TypeError, IndexError): # Fallback if sorting fails or elements aren't as expected
            return "{" + ", ".join(map(str, cp_list)) + "}"

    def _format_relation_output(self, relation):
        """Formats a relation (set of tuples) for display."""
        if not isinstance(relation, set):
            return str(relation)
        # Sort the pairs for consistent output
        # Convert pairs to strings first to handle potential mixed types within pairs
        formatted_pairs = [f"({item[0]}, {item[1]})" for item in relation]
        try:
            formatted_pairs.sort()
        except TypeError:
            pass # Keep original order if sorting fails
            
        return "{" + ", ".join(formatted_pairs) + "}"

# --- Main Execution ---
def run_gui():
    if not has_pyqt:
        print("Error: PyQt5 is not installed. Cannot run the GUI.")
        print("Please install it using: pip install PyQt5")
        return

    app = QApplication(sys.argv)
    main_window = CalculatorGUI()
    main_window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    run_gui()
