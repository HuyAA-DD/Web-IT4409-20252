package com.webtechnology.ecommerce.dto;

import com.webtechnology.ecommerce.enums.PaymentStatus;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayPaymentResponse {

    private String transactionId;
    private String paymentUrl;
    private PaymentStatus status;
    private BigDecimal amount;
}
