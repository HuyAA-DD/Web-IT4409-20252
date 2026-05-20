package com.webtechnology.ecommerce.service;

import java.math.BigDecimal;

import com.webtechnology.ecommerce.dto.SepayPaymentResponse;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;

public interface SepayService {

    SepayPaymentResponse initiatePayment(String externalId,
                                        BigDecimal amount,
                                        String currency,
                                        String returnUrl,
                                        String description);

    SepayTransactionStatusResponse getTransactionStatus(String transactionId, String externalId);

    boolean verifyWebhookSignature(SepayWebhookRequest webhook);

    SepayTransactionStatusResponse processWebhookCallback(SepayWebhookRequest webhook);
}
