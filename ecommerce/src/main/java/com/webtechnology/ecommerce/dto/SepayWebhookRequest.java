package com.webtechnology.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayWebhookRequest {

    private String transactionId;
    private String externalId;
    private String status;
    private String amount;
    private String currency;
    private String timestamp;
    private String signature;
}
