package com.dmc.learning.config;

import java.util.List;

/**
 * Static prerequisite edges between calculator / practice modules.
 * {@code skillTopicSlug} matches {@link com.dmc.problem.entity.StudentSkill#getTopicSlug()}
 * and interactive practice {@code topicSlug} values.
 */
public final class ModuleDependencyGraph {

    private ModuleDependencyGraph() {
    }

    public record CatalogModule(
            String skillTopicSlug,
            String subjectSlug,
            String moduleSlug,
            String displayName,
            List<String> prerequisiteSkillSlugs,
            int estimatedMinutes,
            String difficultyLevel
    ) {
    }

    /**
     * Ordered roughly pedagogically — recommendation ranking is computed per user.
     */
    public static List<CatalogModule> modules() {
        return List.of(
                // ── Discrete Mathematics ─────────────────────────────────────
                new CatalogModule("set_theory", "discrete-math", "set-theory", "Set Theory", List.of(), 20, "beginner"),
                new CatalogModule("combinatorics", "discrete-math", "combinatorics", "Combinatorics", List.of(), 25, "beginner"),
                new CatalogModule("logic", "discrete-math", "logic", "Logic (Intro)", List.of("set_theory"), 25, "beginner"),
                new CatalogModule("number_theory", "discrete-math", "number-theory", "Number Theory", List.of("combinatorics"), 30, "intermediate"),
                new CatalogModule("graph_theory", "discrete-math", "graph-theory", "Graph Theory", List.of("combinatorics"), 30, "intermediate"),
                new CatalogModule("adjacency_matrix", "discrete-math", "adjacency-matrix", "Adjacency Matrix", List.of("graph_theory"), 25, "intermediate"),
                new CatalogModule("probability", "discrete-math", "probability", "Probability (Intro)", List.of("combinatorics"), 25, "beginner"),

                // ── Linear Algebra ─────────────────────────────────────────────
                new CatalogModule("vectors", "linear-algebra", "vectors", "Vectors", List.of(), 25, "beginner"),
                new CatalogModule("matrices", "linear-algebra", "matrices", "Matrices", List.of("vectors"), 30, "intermediate"),
                new CatalogModule("linear_systems", "linear-algebra", "linear-systems", "Linear Systems", List.of("matrices"), 25, "intermediate"),
                new CatalogModule("determinants", "linear-algebra", "determinants", "Determinants", List.of("matrices"), 28, "intermediate"),
                new CatalogModule("eigenvalues", "linear-algebra", "eigenvalues", "Eigenvalues", List.of("determinants", "linear_systems"), 35, "advanced"),
                new CatalogModule("linear_transformations", "linear-algebra", "linear-transformations", "Linear Transformations", List.of("matrices"), 30, "intermediate"),
                new CatalogModule("vector_spaces", "linear-algebra", "vector-spaces", "Vector Spaces", List.of("vectors"), 30, "intermediate"),
                new CatalogModule("orthogonality", "linear-algebra", "orthogonality", "Orthogonality", List.of("vectors"), 28, "intermediate"),

                // ── Probability & Statistics ───────────────────────────────────
                new CatalogModule("probability_basics", "probability-statistics", "probability-basics", "Probability Basics", List.of("combinatorics"), 28, "beginner"),
                new CatalogModule("conditional_probability", "probability-statistics", "conditional-probability", "Conditional Probability", List.of("probability_basics"), 30, "intermediate"),
                new CatalogModule("bayes_theorem", "probability-statistics", "bayes-theorem", "Bayes' Theorem", List.of("conditional_probability"), 30, "intermediate"),
                new CatalogModule("distributions", "probability-statistics", "distributions", "Distributions", List.of("probability_basics"), 32, "intermediate"),

                // ── Algorithms & Data Structures ─────────────────────────────
                new CatalogModule("sorting", "algorithms", "sorting", "Sorting", List.of(), 30, "beginner"),
                new CatalogModule("searching", "algorithms", "searching", "Searching", List.of("sorting"), 25, "beginner"),
                new CatalogModule("asymptotic_analysis", "algorithms", "asymptotic-analysis", "Asymptotic Analysis", List.of("sorting"), 35, "intermediate"),
                new CatalogModule("divide_conquer", "algorithms", "divide-conquer", "Divide and Conquer", List.of("sorting"), 30, "intermediate"),
                new CatalogModule("greedy", "algorithms", "greedy", "Greedy Algorithms", List.of("sorting"), 30, "intermediate"),
                new CatalogModule("dynamic_programming", "algorithms", "dynamic-programming", "Dynamic Programming", List.of("divide_conquer"), 35, "advanced"),
                new CatalogModule("graph_algorithms", "algorithms", "graph-algorithms", "Graph Algorithms", List.of("searching"), 35, "intermediate"),
                new CatalogModule("string_algorithms", "algorithms", "string-algorithms", "String Algorithms", List.of("searching"), 30, "intermediate"),

                // ── Logic & Computation ──────────────────────────────────────
                new CatalogModule("propositional_logic", "it-logic", "propositional-logic", "Propositional Logic", List.of("logic"), 25, "beginner"),
                new CatalogModule("truth_tables", "it-logic", "truth-tables", "Truth Tables", List.of("propositional_logic"), 25, "intermediate"),
                new CatalogModule("equivalence_laws", "it-logic", "equivalence-laws", "Equivalence Laws", List.of("truth_tables"), 28, "intermediate"),
                new CatalogModule("boolean_algebra", "it-logic", "boolean-algebra", "Boolean Algebra", List.of("equivalence_laws"), 28, "intermediate"),
                new CatalogModule("automata", "it-logic", "automata", "Automata", List.of("truth_tables"), 40, "advanced"),

                // ── Calculus ─────────────────────────────────────────────────
                new CatalogModule("limits_continuity", "calculus", "limits-continuity", "Limits & Continuity", List.of(), 30, "beginner"),
                new CatalogModule("derivatives", "calculus", "derivatives", "Derivatives", List.of("limits_continuity"), 35, "intermediate"),
                new CatalogModule("integrals", "calculus", "integrals", "Integrals", List.of("derivatives"), 35, "intermediate"),
                new CatalogModule("series", "calculus", "series", "Series", List.of("derivatives"), 30, "intermediate"),
                new CatalogModule("multivariable", "calculus", "multivariable", "Multivariable Calculus", List.of("derivatives"), 35, "advanced"),
                new CatalogModule("differential_equations", "calculus", "differential-equations", "Differential Equations", List.of("integrals"), 35, "advanced")
        );
    }
}
