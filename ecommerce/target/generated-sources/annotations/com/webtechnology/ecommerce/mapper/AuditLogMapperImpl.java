package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.AuditLogRequest;
import com.webtechnology.ecommerce.dto.AuditLogResponse;
import com.webtechnology.ecommerce.entity.AuditLog;
import com.webtechnology.ecommerce.entity.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-19T22:54:17+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Ubuntu)"
)
@Component
public class AuditLogMapperImpl implements AuditLogMapper {

    @Override
    public AuditLogResponse toResponse(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }

        AuditLogResponse.AuditLogResponseBuilder auditLogResponse = AuditLogResponse.builder();

        auditLogResponse.userId( auditLogUserId( auditLog ) );
        auditLogResponse.userName( auditLogUserFullName( auditLog ) );
        auditLogResponse.id( auditLog.getId() );
        auditLogResponse.action( auditLog.getAction() );
        auditLogResponse.entityType( auditLog.getEntityType() );
        auditLogResponse.entityId( auditLog.getEntityId() );
        auditLogResponse.oldValue( auditLog.getOldValue() );
        auditLogResponse.newValue( auditLog.getNewValue() );
        auditLogResponse.ipAddress( auditLog.getIpAddress() );
        auditLogResponse.createdAt( auditLog.getCreatedAt() );

        return auditLogResponse.build();
    }

    @Override
    public AuditLog toEntity(AuditLogRequest request) {
        if ( request == null ) {
            return null;
        }

        AuditLog.AuditLogBuilder auditLog = AuditLog.builder();

        auditLog.action( request.getAction() );
        auditLog.entityType( request.getEntityType() );
        auditLog.entityId( request.getEntityId() );
        auditLog.oldValue( request.getOldValue() );
        auditLog.newValue( request.getNewValue() );
        auditLog.ipAddress( request.getIpAddress() );

        return auditLog.build();
    }

    private UUID auditLogUserId(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }
        User user = auditLog.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String auditLogUserFullName(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }
        User user = auditLog.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
