package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.AuditLogRequest;
import com.webtechnology.ecommerce.dto.AuditLogResponse;
import com.webtechnology.ecommerce.service.AuditLogService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditLogResponse>> createAuditLog(@Valid @RequestBody AuditLogRequest request) {
        AuditLogResponse response = auditLogService.createAuditLog(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuditLogResponse>builder()
                        .success(true)
                        .message("Audit log created successfully")
                        .data(response)
                        .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAllAuditLogs() {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .message("Audit logs retrieved successfully")
                .data(auditLogService.getAllAuditLogs())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<AuditLogResponse>builder()
                .success(true)
                .message("Audit log retrieved successfully")
                .data(auditLogService.getAuditLogById(id))
                .build());
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .message("Audit logs retrieved successfully")
                .data(auditLogService.getAuditLogsByUserId(userId))
                .build());
    }

    @GetMapping("/by-entity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByEntity(
            @RequestParam String entityType,
            @RequestParam UUID entityId
    ) {
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .success(true)
                .message("Audit logs retrieved successfully")
                .data(auditLogService.getAuditLogsByEntity(entityType, entityId))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditLog(@PathVariable UUID id) {
        auditLogService.deleteAuditLog(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Audit log deleted successfully")
                .data(null)
                .build());
    }
}
