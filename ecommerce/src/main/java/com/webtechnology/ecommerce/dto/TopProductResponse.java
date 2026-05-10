package com.webtechnology.ecommerce.dto;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {

    private UUID productId;
    private String productName;
    private long totalSales;
    private BigDecimal totalRevenue;
}
