package com.webtechnology.ecommerce.service;

import java.util.UUID;

import com.webtechnology.ecommerce.dto.PaymentResponse;
import com.webtechnology.ecommerce.dto.SepayCheckoutRequest;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;

public interface PaymentService {

    PaymentResponse createSepayCheckout(UUID userId, SepayCheckoutRequest request);

    PaymentResponse getPaymentStatus(UUID userId, UUID orderId);

    SepayTransactionStatusResponse queryTransactionStatus(UUID userId, UUID orderId);
}
