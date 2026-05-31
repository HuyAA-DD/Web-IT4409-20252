package com.webtechnology.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload SePay gửi về qua HTTP POST mỗi khi có giao dịch.
 * Tham khảo: https://docs.sepay.vn/webhook-payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayWebhookRequest {

    /** ID giao dịch trên SePay — dùng làm khóa chống trùng lặp (idempotency key) */
    private Long id;

    /** Tên ngân hàng (ví dụ: Vietcombank, BIDV, TPBank) */
    private String gateway;

    /** Thời gian giao dịch, định dạng YYYY-MM-DD HH:mm:ss, giờ Việt Nam */
    private String transactionDate;

    /** Số tài khoản ngân hàng nhận tiền */
    private String accountNumber;

    /** Virtual Account khớp giao dịch, có thể rỗng */
    private String subAccount;

    /**
     * Mã thanh toán trích từ nội dung chuyển khoản theo cấu hình tiền tố.
     * Dùng field này để map về orderId.
     * null nếu không khớp cấu hình nào.
     */
    private String code;

    /** Nội dung chuyển khoản gốc từ ngân hàng */
    private String content;

    /** "in" = tiền vào, "out" = tiền ra */
    private String transferType;

    /** Mô tả đầy đủ từ ngân hàng, có thể rỗng */
    private String description;

    /** Số tiền giao dịch (VNĐ), luôn dương */
    private Long transferAmount;

    /** Số dư sau giao dịch, 0 nếu ngân hàng không hỗ trợ */
    private Long accumulated;

    /** Mã tham chiếu từ ngân hàng, có thể rỗng */
    private String referenceCode;

    // --- Headers xác thực HMAC-SHA256 (set thủ công từ controller) ---

    /** Giá trị header X-SePay-Signature, định dạng: sha256={hex_hash} */
    private String signature;

    /** Giá trị header X-SePay-Timestamp (Unix seconds) */
    private Long timestamp;
}
