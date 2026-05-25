package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;

public interface SepayService {

    /**
     * Xác thực chữ ký HMAC-SHA256 từ header X-SePay-Signature.
     * Format: sha256={hex_hash}, ký trên chuỗi {timestamp}.{raw_body}
     */
    boolean verifyWebhookSignature(String rawBody, String signature, long timestamp);

    /**
     * Xử lý payload webhook đã được xác thực.
     * Trả về thông tin giao dịch đã chuẩn hóa.
     */
    SepayTransactionStatusResponse processWebhookCallback(SepayWebhookRequest webhook);

    /**
     * Query danh sách giao dịch từ SePay API để đối soát thủ công.
     * Dùng API Key trong header Authorization: Apikey {key}
     */
    SepayTransactionStatusResponse getTransactionStatus(String sepayTransactionId);
}
