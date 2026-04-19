package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.NotificationResponse;
import com.webtechnology.ecommerce.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "userId", source = "user.id")
    NotificationResponse toResponse(Notification notification);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "isSent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Notification toEntity(NotificationRequest request);
}
