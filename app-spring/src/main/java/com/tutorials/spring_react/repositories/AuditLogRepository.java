package com.tutorials.spring_react.repositories;

import com.tutorials.spring_react.models.AuditLogModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogModel, Long> {
    List<AuditLogModel> findAllByOrderByTimestampDesc();
}
