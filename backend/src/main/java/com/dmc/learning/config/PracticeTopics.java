package com.dmc.learning.config;

import java.util.List;

/**
 * Interactive AI practice topics ({@code topicSlug} in {@code POST /api/problems/generated}).
 * Kept in sync with {@code frontend/src/catalog/practiceTopicRegistry.js}.
 */
public final class PracticeTopics {

    private PracticeTopics() {
    }

    public static final List<String> ALL_SLUGS = List.of(
            // Discrete Mathematics
            "combinatorics",
            "graph_theory",
            "set_theory",
            "logic",
            "number_theory",
            "probability",
            "adjacency_matrix",
            // Linear Algebra
            "vectors",
            "matrices",
            "linear_systems",
            "determinants",
            "eigenvalues",
            "linear_transformations",
            "vector_spaces",
            "orthogonality",
            // Probability & Statistics
            "probability_basics",
            "conditional_probability",
            "bayes_theorem",
            "distributions",
            // Algorithms & Data Structures
            "asymptotic_analysis",
            "sorting",
            "searching",
            "recursion",
            "graph_algorithms",
            "dynamic_programming",
            "greedy",
            "divide_conquer",
            "string_algorithms",
            // Logic & Computation
            "automata",
            "propositional_logic",
            "truth_tables",
            "equivalence_laws",
            "boolean_algebra",
            // Calculus
            "limits_continuity",
            "derivatives",
            "integrals",
            "series",
            "multivariable",
            "differential_equations",
            // Code-to-math (Math Bug Hunter)
            "code_complexity",
            "code_recurrence"
    );
}
