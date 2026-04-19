package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.NotificationResponse;
import com.webtechnology.ecommerce.entity.Notification;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-19T22:44:18+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Ubuntu)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.id( notification.getId() );
        notificationResponse.title( notification.getTitle() );
        notificationResponse.message( notification.getMessage() );
        notificationResponse.type( notification.getType() );
        notificationResponse.relatedEntityType( notification.getRelatedEntityType() );
        notificationResponse.relatedEntityId( notification.getRelatedEntityId() );
        notificationResponse.isRead( notification.getIsRead() );
        notificationResponse.isSent( notification.getIsSent() );
        notificationResponse.createdAt( notification.getCreatedAt() );
        notificationResponse.updatedAt( notification.getUpdatedAt() );

        return notificationResponse.build();
    }

    @Override
    public Notification toEntity(NotificationRequest request) {
        if ( request == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.title( request.getTitle() );
        notification.message( request.getMessage() );
        notification.type( request.getType() );
        notification.relatedEntityType( request.getRelatedEntityType() );
        notification.relatedEntityId( request.getRelatedEntityId() );

        return notification.build();
    }
}
