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
public class ReviewResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private UUID productId;
    private String productName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
