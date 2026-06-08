package com.webtechnology.ecommerce.controller;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.Payment;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.PaymentRepository;
import com.webtechnology.ecommerce.service.OrderService;
import com.webtechnology.ecommerce.service.SepayService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final SepayService sepayService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;

    /**
     * Endpoint nhận webhook từ SePay.
     *
     * SePay yêu cầu phản hồi HTTP 200 + body {"success": true} trong 30 giây.
     * Mọi lỗi vẫn trả 200 + {"success": true} để SePay không retry vô ích
     * (trừ lỗi xác thực chữ ký — trả 401 để SePay biết có vấn đề bảo mật).
     *
     * Chống trùng lặp: kiểm tra sepayTransactionId trước khi xử lý.
     */
    @PostMapping("/sepay/callback")
    public ResponseEntity<Map<String, Object>> sepayWebhookCallback(
            @RequestHeader(name = "X-SePay-Signature", required = false) String signature,
            @RequestHeader(name = "X-SePay-Timestamp", required = false) Long timestamp,
            @RequestBody byte[] rawBody) {

        String rawBodyStr = new String(rawBody, StandardCharsets.UTF_8);

        // 1. Xác thực chữ ký HMAC-SHA256
        long ts = timestamp != null ? timestamp : 0L;
        if (!sepayService.verifyWebhookSignature(rawBodyStr, signature, ts)) {
            log.warn("Sepay webhook: chữ ký không hợp lệ");
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Invalid signature"));
        }

        // 2. Parse payload
        SepayWebhookRequest webhook;
        try {
            webhook = objectMapper.readValue(rawBody, SepayWebhookRequest.class);
        } catch (Exception e) {
            log.error("Sepay webhook: không parse được payload — {}", e.getMessage());
            // Trả 200 để SePay không retry (payload lỗi thì retry cũng vô ích)
            return ResponseEntity.ok(Map.of("success", true));
        }

        log.info("Sepay webhook nhận được: id={}, gateway={}, amount={}, transferType={}, code={}",
                webhook.getId(), webhook.getGateway(), webhook.getTransferAmount(),
                webhook.getTransferType(), webhook.getCode());

        // 3. Chỉ xử lý giao dịch tiền vào (transferType = "in")
        if (!"in".equalsIgnoreCase(webhook.getTransferType())) {
            log.info("Sepay webhook: bỏ qua giao dịch tiền ra (id={})", webhook.getId());
            return ResponseEntity.ok(Map.of("success", true));
        }

        // 4. Idempotency check — tránh xử lý cùng 1 giao dịch 2 lần
        String sepayTxId = webhook.getId() != null ? webhook.getId().toString() : null;
        if (sepayTxId != null && paymentRepository.existsByTransactionId(sepayTxId)) {
            log.info("Sepay webhook: giao dịch {} đã xử lý trước đó, bỏ qua", sepayTxId);
            return ResponseEntity.ok(Map.of("success", true));
        }

        // 5. Tìm order theo mã thanh toán (field "code" trong payload)
        //    Cấu hình tiền tố tại my.sepay.vn → Cấu hình mã thanh toán
        String paymentCode = webhook.getCode();
        if (paymentCode == null || paymentCode.isBlank()) {
            log.warn("Sepay webhook: giao dịch {} không có mã thanh toán (code=null), bỏ qua", sepayTxId);
            return ResponseEntity.ok(Map.of("success", true));
        }

        try {
            Order order = orderRepository.findByOrderCode(paymentCode).orElse(null);

            if (order == null) {
                log.warn("Sepay webhook: không tìm thấy order với orderCode={}", paymentCode);
                return ResponseEntity.ok(Map.of("success", true));
            }

            UUID orderId = order.getId();

            // 6. Kiểm tra số tiền khớp
            BigDecimal paidAmount = webhook.getTransferAmount() != null
                    ? BigDecimal.valueOf(webhook.getTransferAmount()) : BigDecimal.ZERO;
            boolean amountMatches = order.getTotalAmount().compareTo(paidAmount) == 0;
            if (!amountMatches) {
                log.warn("Sepay webhook: số tiền không khớp — order={}, expected={}, received={}",
                        orderId, order.getTotalAmount(), paidAmount);
                // Vẫn lưu payment nhưng đánh dấu FAILED
            }

            PaymentStatus paymentStatus = amountMatches ? PaymentStatus.PAID : PaymentStatus.FAILED;

            // 7. Lưu Payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .method(PaymentMethod.SEPAY)
                    .transactionId(sepayTxId)
                    .amount(paidAmount)
                    .status(paymentStatus)
                    .paidAt(PaymentStatus.PAID.equals(paymentStatus) ? LocalDateTime.now() : null)
                    .build();
            paymentRepository.save(payment);

            // 8. Cập nhật trạng thái order
            if (PaymentStatus.PAID.equals(paymentStatus)) {
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);
                orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
                orderService.notifySellerOrderPaid(orderId);
                log.info("Sepay webhook: xác nhận thanh toán thành công — orderId={}, amount={}",
                        orderId, paidAmount);
            } else {
                order.setPaymentStatus(PaymentStatus.FAILED);
                orderRepository.save(order);
                log.warn("Sepay webhook: thanh toán thất bại (số tiền sai) — orderId={}", orderId);
            }

        } catch (Exception e) {
            log.error("Sepay webhook: lỗi xử lý giao dịch id={} — {}", sepayTxId, e.getMessage(), e);
        }

        // Luôn trả 200 + {"success": true} để SePay không retry
        return ResponseEntity.ok(Map.of("success", true));
    }
}
