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
public class SepayTransactionStatusResponse {

    private String transactionId;
    private String externalId;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String timestamp;
}
