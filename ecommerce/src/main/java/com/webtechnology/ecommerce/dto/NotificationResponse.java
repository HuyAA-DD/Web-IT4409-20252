package com.webtechnology.ecommerce.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;

    private UUID userId;

    private String title;

    private String message;

    private String type;

    private String relatedEntityType;

    private UUID relatedEntityId;

    private Boolean isRead;

    private Boolean isSent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
