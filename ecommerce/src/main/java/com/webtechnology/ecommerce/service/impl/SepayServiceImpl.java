package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.SepayPaymentResponse;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.service.SepayService;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
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

    @Value("${sepay.webhook-secret:}")
    private String webhookSecret;

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

    @Override
    public SepayTransactionStatusResponse getTransactionStatus(String transactionId, String externalId) {
        String statusUrl = apiUrl.replace("/payments", "/transactions/status");
        SepayTransactionStatusRequest statusRequest = new SepayTransactionStatusRequest(transactionId, externalId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Authorization", "Bearer " + merchantKey);
        HttpEntity<SepayTransactionStatusRequest> httpEntity = new HttpEntity<>(statusRequest, headers);

        ResponseEntity<SepayStatusResponse> response = restTemplate.postForEntity(statusUrl, httpEntity, SepayStatusResponse.class);
        SepayStatusResponse body = response.getBody();

        if (body == null) {
            throw new BadRequestException("Failed to get transaction status from Sepay");
        }

        return SepayTransactionStatusResponse.builder()
                .transactionId(body.getTransactionId())
                .externalId(body.getExternalId())
                .status(body.getStatus())
                .amount(new BigDecimal(body.getAmount() != null ? body.getAmount() : "0"))
                .currency(body.getCurrency())
                .timestamp(body.getTimestamp())
                .build();
    }

    @Override
    public boolean verifyWebhookSignature(SepayWebhookRequest webhook) {
        if (webhook.getSignature() == null || webhook.getSignature().isBlank()) {
            return false;
        }
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new BadRequestException("Sepay webhook secret is not configured");
        }

        String dataToSign = webhook.getTransactionId() + "|"
                + webhook.getExternalId() + "|"
                + webhook.getStatus() + "|"
                + webhook.getAmount();

        String expectedSignature = hmacSha256(dataToSign, webhookSecret);
        return expectedSignature.equalsIgnoreCase(webhook.getSignature());
    }

    @Override
    public SepayTransactionStatusResponse processWebhookCallback(SepayWebhookRequest webhook) {
        if (!verifyWebhookSignature(webhook)) {
            throw new BadRequestException("Invalid webhook signature");
        }

        return SepayTransactionStatusResponse.builder()
                .transactionId(webhook.getTransactionId())
                .externalId(webhook.getExternalId())
                .status(webhook.getStatus())
                .amount(new BigDecimal(webhook.getAmount() != null ? webhook.getAmount() : "0"))
                .currency(webhook.getCurrency())
                .timestamp(webhook.getTimestamp())
                .build();
    }

    private String hmacSha256(String input, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new BadRequestException("HMAC-SHA256 calculation failed");
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class SepayTransactionStatusRequest {
        private String transactionId;
        private String externalId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class SepayStatusResponse {
        private String transactionId;
        private String externalId;
        private String status;
        private String amount;
        private String currency;
        private String timestamp;
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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class SepayRequest {
        private String merchantCode;
        private String merchantKey;
        private String externalId;
        private BigDecimal amount;
        private String currency;
        private String returnUrl;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class SepayResponse {
        private String transactionId;
        private String paymentUrl;
        private String status;
    }
}
