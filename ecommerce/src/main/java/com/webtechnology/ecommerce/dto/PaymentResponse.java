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

    /** URL thanh toán (dùng cho các cổng redirect, không dùng cho SePay) */
    private String paymentUrl;

    /**
     * Nội dung chuyển khoản cần ghi vào ô "nội dung" khi chuyển tiền.
     * Đây chính là mã thanh toán SePay dùng để map về order (field "code" trong webhook).
     * Ví dụ: orderId của đơn hàng
     */
    private String transferContent;

    /** Số tài khoản ngân hàng nhận tiền (cấu hình trong SePay) */
    private String bankAccountNumber;

    /** Tên ngân hàng */
    private String bankName;

    /**
     * URL ảnh QR VietQR — khi khách quét bằng app ngân hàng sẽ tự điền sẵn
     * số tài khoản, số tiền và nội dung chuyển khoản. Khách chỉ cần bấm xác nhận.
     */
    private String qrCodeUrl;
}
