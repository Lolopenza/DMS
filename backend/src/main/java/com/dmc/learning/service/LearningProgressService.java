package com.dmc.learning.service;

import com.dmc.common.exception.ApiException;
import com.dmc.learning.config.ModuleDependencyGraph;
import com.dmc.learning.config.ModuleDependencyGraph.CatalogModule;
import com.dmc.learning.dto.JourneyNextModuleDto;
import com.dmc.learning.dto.LearningJourneySnapshotDto;
import com.dmc.learning.dto.ModuleRecommendationDto;
import com.dmc.learning.dto.SubjectProgressDto;
import com.dmc.problem.bkt.BktMasteryMath;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningProgressService {

    /**
     * Progress-ring “module completed” threshold (dashboard journey). Lower than recommendation TARGET_MASTERED_PERCENT (92).
     */
    public static final int MODULE_COMPLETE_THRESHOLD_PERCENT = 80;

    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;

    public List<SubjectProgressDto> subjectProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a, HashMap::new));

        Map<String, List<CatalogModule>> bySubject = ModuleDependencyGraph.modules().stream()
                .collect(Collectors.groupingBy(CatalogModule::subjectSlug));

        List<SubjectProgressDto> rows = new ArrayList<>();
        for (Map.Entry<String, List<CatalogModule>> e : bySubject.entrySet()) {
            String subjectSlug = e.getKey();
            List<CatalogModule> mods = e.getValue();
            int total = mods.size();
            int sumPct = 0;
            int completed = 0;
            for (CatalogModule m : mods) {
                int pct = BktMasteryMath.adjustedMasteryPercent(skillByTopic, m.skillTopicSlug());
                sumPct += pct;
                if (pct >= MODULE_COMPLETE_THRESHOLD_PERCENT) {
                    completed++;
                }
            }
            int avg = total > 0 ? Math.round((float) sumPct / total) : 0;
            rows.add(new SubjectProgressDto(subjectSlug, subjectDisplayName(subjectSlug), avg, completed, total));
        }
        rows.sort(Comparator.comparing(SubjectProgressDto::subjectSlug));
        return rows;
    }

    public LearningJourneySnapshotDto journeySnapshot(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a, HashMap::new));

        List<CatalogModule> all = ModuleDependencyGraph.modules();
        int totalModules = all.size();
        int completedGlobal = 0;
        for (CatalogModule m : all) {
            int pct = BktMasteryMath.adjustedMasteryPercent(skillByTopic, m.skillTopicSlug());
            if (pct >= MODULE_COMPLETE_THRESHOLD_PERCENT) {
                completedGlobal++;
            }
        }

        List<ModuleRecommendationDto> recs = recommendationService.recommendModules(userId);
        JourneyNextModuleDto next = null;
        String goal;
        if (!recs.isEmpty()) {
            ModuleRecommendationDto r = recs.get(0);
            next = new JourneyNextModuleDto(r.moduleSlug(), r.subject(), r.moduleName());
            goal = "Next focus: " + r.moduleName();
        } else {
            goal = "Explore tracks — mastery updates when you practice.";
        }

        return new LearningJourneySnapshotDto(goal, completedGlobal, totalModules, next);
    }

    private static String subjectDisplayName(String subjectSlug) {
        return switch (subjectSlug) {
            case "discrete-math" -> "Discrete Mathematics";
            case "linear-algebra" -> "Linear Algebra";
            case "algorithms" -> "Algorithms & Data Structures";
            case "probability-statistics" -> "Probability & Statistics";
            case "it-logic" -> "Logic & Automata";
            default -> subjectSlug;
        };
    }
}
