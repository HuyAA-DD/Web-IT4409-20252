package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.SepayPaymentResponse;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.service.SepayService;
import java.math.BigDecimal;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class SepayServiceImpl implements SepayService {

    private final RestTemplate restTemplate;

    @Value("${sepay.api.url}")
    private String apiUrl;

    @Value("${sepay.merchant-code}")
    private String merchantCode;

    @Value("${sepay.merchant-key}")
    private String merchantKey;

    @Value("${sepay.currency:VND}")
    private String currency;

    @Override
    public SepayPaymentResponse initiatePayment(String externalId,
                                               BigDecimal amount,
                                               String currency,
                                               String returnUrl,
                                               String description) {
        SepayRequest request = new SepayRequest(
                merchantCode,
                merchantKey,
                externalId,
                amount,
                currency == null ? this.currency : currency,
                returnUrl,
                description
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SepayRequest> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<SepayResponse> response = restTemplate.postForEntity(apiUrl, httpEntity, SepayResponse.class);
        SepayResponse body = response.getBody();

        if (body == null || body.getPaymentUrl() == null) {
            throw new BadRequestException("Failed to initiate Sepay payment");
        }

        PaymentStatus status = mapPaymentStatus(body.getStatus());
        return SepayPaymentResponse.builder()
                .transactionId(body.getTransactionId())
                .paymentUrl(body.getPaymentUrl())
                .status(status)
                .amount(amount)
                .build();
    }

    private PaymentStatus mapPaymentStatus(String status) {
        if (status == null) {
            return PaymentStatus.PENDING;
        }
        if ("PAID".equalsIgnoreCase(status) || "SUCCESS".equalsIgnoreCase(status)) {
            return PaymentStatus.PAID;
        }
        if ("FAILED".equalsIgnoreCase(status) || "ERROR".equalsIgnoreCase(status)) {
            return PaymentStatus.FAILED;
        }
        if ("CANCELLED".equalsIgnoreCase(status)) {
            return PaymentStatus.CANCELLED;
        }
        return PaymentStatus.PENDING;
    }

    private static class SepayRequest {

        private final String merchantCode;
        private final String merchantKey;
        private final String externalId;
        private final BigDecimal amount;
        private final String currency;
        private final String returnUrl;
        private final String description;

        public SepayRequest(String merchantCode,
                            String merchantKey,
                            String externalId,
                            BigDecimal amount,
                            String currency,
                            String returnUrl,
                            String description) {
            this.merchantCode = merchantCode;
            this.merchantKey = merchantKey;
            this.externalId = externalId;
            this.amount = amount;
            this.currency = currency;
            this.returnUrl = returnUrl;
            this.description = description;
        }

        public String getMerchantCode() {
            return merchantCode;
        }

        public String getMerchantKey() {
            return merchantKey;
        }

        public String getExternalId() {
            return externalId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getCurrency() {
            return currency;
        }

        public String getReturnUrl() {
            return returnUrl;
        }

        public String getDescription() {
            return description;
        }
    }

    private static class SepayResponse {

        private String transactionId;
        private String paymentUrl;
        private String status;

        public String getTransactionId() {
            return transactionId;
        }

        public void setTransactionId(String transactionId) {
            this.transactionId = transactionId;
        }

        public String getPaymentUrl() {
            return paymentUrl;
        }

        public void setPaymentUrl(String paymentUrl) {
            this.paymentUrl = paymentUrl;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
