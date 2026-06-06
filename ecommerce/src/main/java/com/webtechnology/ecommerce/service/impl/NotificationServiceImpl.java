package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.NotificationResponse;
import com.webtechnology.ecommerce.entity.Notification;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.NotificationMapper;
import com.webtechnology.ecommerce.repository.NotificationRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.NotificationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = notificationMapper.toEntity(request);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        notification.setUser(user);
        Notification savedNotification = notificationRepository.save(notification);
        return notificationMapper.toResponse(savedNotification);
    }

    @Override
    public NotificationResponse createOrderNotification(
            UUID userId,
            UUID orderId,
            String title,
            String message
    ) {
        return createNotification(NotificationRequest.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type("ORDER")
                .relatedEntityType("ORDER")
                .relatedEntityId(orderId)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID id) {
        return notificationMapper.toResponse(findNotificationById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(UUID userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsByUserId(UUID userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(UUID id, UUID requesterId) {
        Notification notification = findNotificationById(id);
        // Chỉ owner mới được đánh dấu đã đọc
        if (!notification.getUser().getId().equals(requesterId) && !isCurrentUserAdmin()) {
            throw new com.webtechnology.ecommerce.exception.BadRequestException(
                    "You are not authorized to mark this notification as read");
        }
        notification.setIsRead(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public NotificationResponse markAsSent(UUID id) {
        Notification notification = findNotificationById(id);
        notification.setIsSent(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toResponse(updatedNotification);
    }

    @Override
    public void deleteNotification(UUID id) {
        Notification notification = findNotificationById(id);
        notificationRepository.delete(notification);
    }

    @Override
    public void deleteNotification(UUID id, UUID requesterId) {
        Notification notification = findNotificationById(id);
        if (!notification.getUser().getId().equals(requesterId) && !isCurrentUserAdmin()) {
            throw new com.webtechnology.ecommerce.exception.BadRequestException(
                    "You are not authorized to delete this notification");
        }
        notificationRepository.delete(notification);
    }

    @Override
    public void deleteNotificationsByUserId(UUID userId) {
        notificationRepository.deleteByUserId(userId);
    }

    private Notification findNotificationById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    private boolean isCurrentUserAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
