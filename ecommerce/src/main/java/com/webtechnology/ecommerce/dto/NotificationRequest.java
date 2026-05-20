package com.webtechnology.ecommerce.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    private UUID userId;

    private String title;

    private String message;

    private String type;

    private String relatedEntityType;

    private UUID relatedEntityId;
}
