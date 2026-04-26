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
    date = "2026-04-26T14:41:27+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
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
        auditLogResponse.action( auditLog.getAction() );
        auditLogResponse.createdAt( auditLog.getCreatedAt() );
        auditLogResponse.entityId( auditLog.getEntityId() );
        auditLogResponse.entityType( auditLog.getEntityType() );
        auditLogResponse.id( auditLog.getId() );
        auditLogResponse.ipAddress( auditLog.getIpAddress() );
        auditLogResponse.newValue( auditLog.getNewValue() );
        auditLogResponse.oldValue( auditLog.getOldValue() );

        return auditLogResponse.build();
    }

    @Override
    public AuditLog toEntity(AuditLogRequest request) {
        if ( request == null ) {
            return null;
        }

        AuditLog.AuditLogBuilder auditLog = AuditLog.builder();

        auditLog.action( request.getAction() );
        auditLog.entityId( request.getEntityId() );
        auditLog.entityType( request.getEntityType() );
        auditLog.ipAddress( request.getIpAddress() );
        auditLog.newValue( request.getNewValue() );
        auditLog.oldValue( request.getOldValue() );

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
