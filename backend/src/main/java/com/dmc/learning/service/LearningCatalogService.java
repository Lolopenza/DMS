package com.dmc.learning.service;

import com.dmc.learning.config.ModuleDependencyGraph;
import com.dmc.learning.dto.ModuleCatalogEntryDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningCatalogService {

    public List<ModuleCatalogEntryDto> listModuleCatalog() {
        return ModuleDependencyGraph.modules().stream()
                .map(m -> new ModuleCatalogEntryDto(
                        m.subjectSlug(),
                        m.moduleSlug(),
                        m.skillTopicSlug(),
                        m.displayName()))
                .toList();
    }
}
