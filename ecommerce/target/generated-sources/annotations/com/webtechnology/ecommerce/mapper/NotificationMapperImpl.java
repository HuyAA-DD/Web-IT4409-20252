package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.NotificationResponse;
import com.webtechnology.ecommerce.entity.Notification;
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
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.userId( notificationUserId( notification ) );
        notificationResponse.createdAt( notification.getCreatedAt() );
        notificationResponse.id( notification.getId() );
        notificationResponse.isRead( notification.getIsRead() );
        notificationResponse.isSent( notification.getIsSent() );
        notificationResponse.message( notification.getMessage() );
        notificationResponse.relatedEntityId( notification.getRelatedEntityId() );
        notificationResponse.relatedEntityType( notification.getRelatedEntityType() );
        notificationResponse.title( notification.getTitle() );
        notificationResponse.type( notification.getType() );
        notificationResponse.updatedAt( notification.getUpdatedAt() );

        return notificationResponse.build();
    }

    @Override
    public Notification toEntity(NotificationRequest request) {
        if ( request == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.message( request.getMessage() );
        notification.relatedEntityId( request.getRelatedEntityId() );
        notification.relatedEntityType( request.getRelatedEntityType() );
        notification.title( request.getTitle() );
        notification.type( request.getType() );

        return notification.build();
    }

    private UUID notificationUserId(Notification notification) {
        if ( notification == null ) {
            return null;
        }
        User user = notification.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
