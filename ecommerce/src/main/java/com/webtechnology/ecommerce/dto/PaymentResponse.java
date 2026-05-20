package com.webtechnology.ecommerce.dto;

import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
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
public class PaymentResponse {

    private UUID orderId;
    private String transactionId;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String paymentUrl;
}
