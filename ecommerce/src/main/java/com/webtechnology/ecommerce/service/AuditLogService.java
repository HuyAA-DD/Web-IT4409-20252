package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.AuditLogRequest;
import com.webtechnology.ecommerce.dto.AuditLogResponse;
import java.util.List;
import java.util.UUID;

public interface AuditLogService {

    AuditLogResponse createAuditLog(AuditLogRequest request);

    List<AuditLogResponse> getAllAuditLogs();

    AuditLogResponse getAuditLogById(UUID id);

    List<AuditLogResponse> getAuditLogsByUserId(UUID userId);

    List<AuditLogResponse> getAuditLogsByEntity(String entityType, UUID entityId);

    void deleteAuditLog(UUID id);
}
