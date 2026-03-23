package com.dmc.problem.repository;

import com.dmc.problem.entity.CalcHistory;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalcHistoryRepository extends JpaRepository<CalcHistory, Long> {
    List<CalcHistory> findTop100ByUserOrderByCreatedAtDesc(User user);
}
