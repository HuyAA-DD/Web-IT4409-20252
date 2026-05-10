package com.webtechnology.ecommerce.service;

import java.math.BigDecimal;

import com.webtechnology.ecommerce.dto.SepayPaymentResponse;

public interface SepayService {

    SepayPaymentResponse initiatePayment(String externalId,
                                        BigDecimal amount,
                                        String currency,
                                        String returnUrl,
                                        String description);
}
