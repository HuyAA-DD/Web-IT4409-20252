package com.webtechnology.ecommerce.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogRequest {

    private UUID userId;

    private String action;

    private String entityType;

    private UUID entityId;

    private String oldValue;

    private String newValue;

    private String ipAddress;
}
