package com.webtechnology.ecommerce.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private UUID id;

    private UUID userId;

    private String userName;

    private String action;

    private String entityType;

    private UUID entityId;

    private String oldValue;

    private String newValue;

    private String ipAddress;

    private LocalDateTime createdAt;
}
