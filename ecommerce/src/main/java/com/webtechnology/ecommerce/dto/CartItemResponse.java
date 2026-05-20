package com.webtechnology.ecommerce.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private UUID productVariantId;
    private String sku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;
    private Map<String, Object> attributes;
}
