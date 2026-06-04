package com.tutorials.spring_react.controllers;

import com.tutorials.spring_react.models.AuditLogModel;
import com.tutorials.spring_react.repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public List<AuditLogModel> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
