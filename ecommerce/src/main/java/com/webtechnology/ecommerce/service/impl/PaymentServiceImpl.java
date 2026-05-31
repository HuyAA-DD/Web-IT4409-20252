package com.webtechnology.ecommerce.service.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtechnology.ecommerce.dto.PaymentResponse;
import com.webtechnology.ecommerce.dto.SepayCheckoutRequest;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.Payment;
import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.PaymentRepository;
import com.webtechnology.ecommerce.service.PaymentService;
import com.webtechnology.ecommerce.service.SepayService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SepayService sepayService;

    @Value("${sepay.bank-account-number:}")
    private String bankAccountNumber;

    @Value("${sepay.bank-name:}")
    private String bankName;

    @Value("${sepay.bank-id:}")
    private String bankId;

    /**
     * Tạo thông tin thanh toán SePay (chuyển khoản ngân hàng).
     *
     * SePay hoạt động theo mô hình bank transfer — không có redirect URL.
     * Trả về thông tin tài khoản + nội dung chuyển khoản để frontend hiển thị cho khách.
     * Nội dung chuyển khoản = orderId (SePay sẽ trích ra làm field "code" trong webhook).
     */
    @Override
    public PaymentResponse createSepayCheckout(UUID userId, SepayCheckoutRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to pay for this order");
        }

        if (!PaymentMethod.SEPAY.equals(order.getPaymentMethod())) {
            throw new BadRequestException("Order payment method is not SEPAY");
        }

        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            throw new BadRequestException("Payment has already been completed for this order");
        }

        // Nội dung chuyển khoản = orderCode (ví dụ: DH12345678)
        // Cấu hình tại my.sepay.vn → Cấu hình mã thanh toán:
        //   Tiền tố: DH | Hậu tố: 6-10 ký tự | Loại: Số nguyên
        String transferContent = order.getOrderCode();

        // Sinh QR SePay — khi khách quét sẽ tự điền sẵn tất cả thông tin
        // Khách chỉ cần bấm xác nhận, không cần gõ nội dung thủ công
        String qrCodeUrl = buildSepayQrUrl(order.getTotalAmount(), transferContent);

        return PaymentResponse.builder()
                .orderId(order.getId())
                .amount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .transferContent(transferContent)
                .bankAccountNumber(bankAccountNumber)
                .bankName(bankName)
                .qrCodeUrl(qrCodeUrl)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view payment status for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        return PaymentResponse.builder()
                .orderId(orderId)
                .transactionId(payment != null ? payment.getTransactionId() : null)
                .amount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SepayTransactionStatusResponse queryTransactionStatus(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to query payment status for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        // Query SePay API bằng sepayTransactionId đã lưu
        return sepayService.getTransactionStatus(payment.getTransactionId());
    }

    /**
     * Sinh URL ảnh QR của SePay.
     * Khi khách quét bằng app ngân hàng, toàn bộ thông tin được điền sẵn tự động.
     * Lấy thông tin tài khoản tại: my.sepay.vn → Tài khoản ngân hàng → QR Code
     *
     * Format: https://qr.sepay.vn/img?acc={account}&bank={bankId}&amount={amount}&des={content}
     */
    private String buildSepayQrUrl(java.math.BigDecimal amount, String transferContent) {
        if (bankId == null || bankId.isBlank()
                || bankAccountNumber == null || bankAccountNumber.isBlank()) {
            return null;
        }
        try {
            String encodedContent = java.net.URLEncoder.encode(transferContent, "UTF-8");
            return String.format(
                    "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s&template=compact",
                    bankAccountNumber,
                    bankId,
                    amount.toBigInteger(),
                    encodedContent
            );
        } catch (java.io.UnsupportedEncodingException e) {
            return null;
        }
    }
}
