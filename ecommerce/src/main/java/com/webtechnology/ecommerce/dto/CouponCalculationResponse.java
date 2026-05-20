package com.webtechnology.ecommerce.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponCalculationResponse {
    private String code;

    private String discountType;

    private BigDecimal discountValue;

    private BigDecimal discountAmount;

    private BigDecimal originalAmount;

    private BigDecimal finalAmount;

    private Boolean isValid;

    private String message;
}

