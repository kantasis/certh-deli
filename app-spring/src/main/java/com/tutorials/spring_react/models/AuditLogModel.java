package com.tutorials.spring_react.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs_tbl")
@Data
@NoArgsConstructor
public class AuditLogModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false, length = 50)
    private String action;

    @Column(length = 100)
    private String performedBy;

    @Column(length = 100)
    private String target;

    @Column(length = 500)
    private String details;

    public AuditLogModel(String action, String performedBy, String target, String details) {
        this.action = action;
        this.performedBy = performedBy;
        this.target = target;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
