package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.NotificationResponse;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    List<NotificationResponse> getAllNotifications();

    NotificationResponse getNotificationById(UUID id);

    List<NotificationResponse> getNotificationsByUserId(UUID userId);

    List<NotificationResponse> getUnreadNotificationsByUserId(UUID userId);

    NotificationResponse markAsRead(UUID id, UUID requesterId);

    NotificationResponse markAsSent(UUID id);

    void deleteNotification(UUID id);

    void deleteNotificationsByUserId(UUID userId);
}
