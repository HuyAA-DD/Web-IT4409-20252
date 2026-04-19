package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserId(UUID userId);

    List<Notification> findByUserIdAndIsRead(UUID userId, Boolean isRead);

    void deleteByUserId(UUID userId);
}
