package com.dmc.learning.config;

import java.util.List;

/**
 * Static prerequisite edges between calculator modules.
 * {@code skillTopicSlug} matches {@link com.dmc.problem.entity.StudentSkill#getTopicSlug()}
 * where practice exists; otherwise the learner is treated as carrying only the BKT prior until data appears.
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
     * Ordered roughly pedagogically — recommendation ranking still computed dynamically per user.
     */
    public static List<CatalogModule> modules() {
        return List.of(
                new CatalogModule(
                        "set_theory",
                        "discrete-math",
                        "set-theory",
                        "Set Theory",
                        List.of(),
                        20,
                        "beginner"
                ),
                new CatalogModule(
                        "combinatorics",
                        "discrete-math",
                        "combinatorics",
                        "Combinatorics",
                        List.of(),
                        25,
                        "beginner"
                ),
                new CatalogModule(
                        "logic",
                        "discrete-math",
                        "logic",
                        "Logic (Intro)",
                        List.of("set_theory"),
                        25,
                        "beginner"
                ),
                new CatalogModule(
                        "graph_theory",
                        "discrete-math",
                        "graph-theory",
                        "Graph Theory",
                        List.of("combinatorics"),
                        30,
                        "intermediate"
                ),
                new CatalogModule(
                        "number_theory",
                        "discrete-math",
                        "number-theory",
                        "Number Theory",
                        List.of("combinatorics"),
                        30,
                        "intermediate"
                ),
                new CatalogModule(
                        "vectors",
                        "linear-algebra",
                        "vectors",
                        "Vectors",
                        List.of(),
                        25,
                        "beginner"
                ),
                new CatalogModule(
                        "matrices",
                        "linear-algebra",
                        "matrices",
                        "Matrices",
                        List.of("vectors"),
                        30,
                        "intermediate"
                ),
                new CatalogModule(
                        "linear_systems",
                        "linear-algebra",
                        "linear-systems",
                        "Linear Systems",
                        List.of("matrices"),
                        25,
                        "intermediate"
                ),
                new CatalogModule(
                        "determinants",
                        "linear-algebra",
                        "determinants",
                        "Determinants",
                        List.of("matrices"),
                        28,
                        "intermediate"
                ),
                new CatalogModule(
                        "eigenvalues",
                        "linear-algebra",
                        "eigenvalues",
                        "Eigenvalues",
                        List.of("determinants", "linear_systems"),
                        35,
                        "advanced"
                ),
                new CatalogModule(
                        "probability_basics",
                        "probability-statistics",
                        "probability-basics",
                        "Probability Basics",
                        List.of("combinatorics"),
                        28,
                        "beginner"
                ),
                new CatalogModule(
                        "sorting",
                        "algorithms",
                        "sorting",
                        "Sorting",
                        List.of(),
                        30,
                        "beginner"
                ),
                new CatalogModule(
                        "asymptotic_analysis",
                        "algorithms",
                        "asymptotic-analysis",
                        "Asymptotic Analysis",
                        List.of("sorting"),
                        35,
                        "intermediate"
                ),
                new CatalogModule(
                        "truth_tables",
                        "it-logic",
                        "truth-tables",
                        "Truth Tables",
                        List.of("logic"),
                        25,
                        "intermediate"
                ),
                new CatalogModule(
                        "automata",
                        "it-logic",
                        "automata",
                        "Automata",
                        List.of("truth_tables"),
                        40,
                        "advanced"
                )
        );
    }
}
