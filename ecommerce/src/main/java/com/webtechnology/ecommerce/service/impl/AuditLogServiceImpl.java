package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AuditLogRequest;
import com.webtechnology.ecommerce.dto.AuditLogResponse;
import com.webtechnology.ecommerce.entity.AuditLog;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.AuditLogMapper;
import com.webtechnology.ecommerce.repository.AuditLogRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AuditLogService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public AuditLogResponse createAuditLog(AuditLogRequest request) {
        AuditLog auditLog = auditLogMapper.toEntity(request);
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
            auditLog.setUser(user);
        }
        AuditLog savedAuditLog = auditLogRepository.save(auditLog);
        return auditLogMapper.toResponse(savedAuditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAll()
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(UUID id) {
        return auditLogMapper.toResponse(findAuditLogById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByUserId(UUID userId) {
        return auditLogRepository.findByUserId(userId)
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByEntity(String entityType, UUID entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteAuditLog(UUID id) {
        AuditLog auditLog = findAuditLogById(id);
        auditLogRepository.delete(auditLog);
    }

    private AuditLog findAuditLogById(UUID id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog not found with id: " + id));
    }
}
