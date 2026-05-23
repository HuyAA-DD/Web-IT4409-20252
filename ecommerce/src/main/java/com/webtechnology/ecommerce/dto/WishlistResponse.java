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
public class WishlistResponse {

    private UUID id;
    private UUID userId;
    private UUID productId;
    private String productName;
    private LocalDateTime createdAt;
}
