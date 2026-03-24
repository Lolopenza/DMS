package com.dmc.problem.repository;

import com.dmc.problem.entity.StudentSkill;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {

    Optional<StudentSkill> findByUserAndTopicSlug(User user, String topicSlug);

    List<StudentSkill> findByUserOrderByUpdatedAtDesc(User user);
}
