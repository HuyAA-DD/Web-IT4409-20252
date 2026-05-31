package com.webtechnology.ecommerce.service.impl;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.service.SepayService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayServiceImpl implements SepayService {

    private final RestTemplate restTemplate;

    /** API Key lấy từ my.sepay.vn → API Access — dùng cho cả xác thực API lẫn webhook */
    @Value("${sepay.api-key:}")
    private String apiKey;

    /** Secret Key lấy từ my.sepay.vn → Webhooks → cấu hình HMAC-SHA256 */
    @Value("${sepay.webhook-secret:}")
    private String webhookSecret;

    /** Base URL API SePay, mặc định production */
    @Value("${sepay.api.url:https://my.sepay.vn/userapi}")
    private String apiUrl;

    /**
     * Xác thực chữ ký HMAC-SHA256 theo đúng spec SePay:
     * - Header X-SePay-Signature: sha256={hex_hash}
     * - Header X-SePay-Timestamp: unix_seconds
     * - Chuỗi ký: {timestamp}.{raw_body}
     * - Chống replay: timestamp không được lệch quá 5 phút
     */
    @Override
    public boolean verifyWebhookSignature(String rawBody, String signature, long timestamp) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("SEPAY_WEBHOOK_SECRET chưa cấu hình — bỏ qua xác thực chữ ký. Không nên dùng trên production.");
            return true;
        }

        // Chống replay attack: timestamp không được lệch quá 5 phút
        long now = Instant.now().getEpochSecond();
        if (Math.abs(now - timestamp) > 300) {
            log.warn("Sepay webhook timestamp quá cũ hoặc tương lai: {} (now={})", timestamp, now);
            return false;
        }

        if (signature == null || !signature.startsWith("sha256=")) {
            log.warn("Sepay webhook thiếu hoặc sai format chữ ký: {}", signature);
            return false;
        }

        // Tái tạo chữ ký: HMAC-SHA256("{timestamp}.{raw_body}", secret)
        String dataToSign = timestamp + "." + rawBody;
        String expectedSignature = "sha256=" + hmacSha256(dataToSign, webhookSecret);

        boolean valid = expectedSignature.equalsIgnoreCase(signature);
        if (!valid) {
            log.warn("Sepay webhook chữ ký không khớp. Expected: {}, Got: {}", expectedSignature, signature);
        }
        return valid;
    }

    /**
     * Chuẩn hóa payload webhook thành SepayTransactionStatusResponse.
     * Chỉ gọi sau khi đã xác thực chữ ký.
     */
    @Override
    public SepayTransactionStatusResponse processWebhookCallback(SepayWebhookRequest webhook) {
        return SepayTransactionStatusResponse.builder()
                .transactionId(webhook.getId() != null ? webhook.getId().toString() : null)
                // code = mã thanh toán trích từ nội dung (ví dụ: DH123456) — dùng để map orderId
                .externalId(webhook.getCode())
                // SePay webhook không có trường "status" — nếu nhận được là tiền đã vào
                .status(isMoneyIn(webhook) ? "PAID" : "OUT")
                .amount(webhook.getTransferAmount() != null
                        ? BigDecimal.valueOf(webhook.getTransferAmount()) : BigDecimal.ZERO)
                .currency("VND")
                .timestamp(webhook.getTransactionDate())
                .build();
    }

    /**
     * Query giao dịch từ SePay API bằng API Key.
     * Endpoint: GET {apiUrl}/transactions/list?transaction_id={id}
     */
    @Override
    public SepayTransactionStatusResponse getTransactionStatus(String sepayTransactionId) {
        String url = apiUrl + "/transactions/list?transaction_id=" + sepayTransactionId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Apikey " + apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<SepayApiResponse> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, SepayApiResponse.class);
            SepayApiResponse body = response.getBody();

            if (body == null || body.getTransactions() == null || body.getTransactions().isEmpty()) {
                throw new BadRequestException("Không tìm thấy giao dịch SePay: " + sepayTransactionId);
            }

            SepayApiTransaction tx = body.getTransactions().get(0);
            return SepayTransactionStatusResponse.builder()
                    .transactionId(String.valueOf(tx.getId()))
                    .externalId(tx.getCode())
                    .status("in".equalsIgnoreCase(tx.getTransferType()) ? "PAID" : "OUT")
                    .amount(tx.getTransferAmount() != null
                            ? BigDecimal.valueOf(tx.getTransferAmount()) : BigDecimal.ZERO)
                    .currency("VND")
                    .timestamp(tx.getTransactionDate())
                    .build();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi query SePay API: {}", e.getMessage());
            throw new BadRequestException("Không thể lấy trạng thái giao dịch từ SePay: " + e.getMessage());
        }
    }

    // --- Helpers ---

    private boolean isMoneyIn(SepayWebhookRequest webhook) {
        return "in".equalsIgnoreCase(webhook.getTransferType());
    }

    private String hmacSha256(String input, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new BadRequestException("HMAC-SHA256 thất bại: " + e.getMessage());
        }
    }

    // --- Inner DTOs cho SePay API response ---

    @Getter @Setter
    private static class SepayApiResponse {
        private java.util.List<SepayApiTransaction> transactions;
    }

    @Getter @Setter
    private static class SepayApiTransaction {
        private Long id;
        private String gateway;
        private String transactionDate;
        private String accountNumber;
        private String code;
        private String content;
        private String transferType;
        private Long transferAmount;
        private String referenceCode;
    }
}
