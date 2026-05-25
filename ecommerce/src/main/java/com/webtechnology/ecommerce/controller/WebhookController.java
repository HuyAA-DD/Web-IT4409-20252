package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.SepayWebhookRequest;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.Payment;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.PaymentRepository;
import com.webtechnology.ecommerce.service.OrderService;
import com.webtechnology.ecommerce.service.SepayService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final SepayService sepayService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/sepay/callback")
    public ResponseEntity<ApiResponse<String>> sepayWebhookCallback(
            @RequestHeader(name = "X-SePay-Signature", required = false) String signature,
            @Valid @RequestBody SepayWebhookRequest webhook) {
        try {
            if (signature != null && !signature.isBlank()) {
                webhook.setSignature(signature);
            }
            SepayTransactionStatusResponse statusResponse = sepayService.processWebhookCallback(webhook);
            
            UUID orderId = UUID.fromString(webhook.getExternalId());
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

            PaymentStatus paymentStatus = mapPaymentStatus(statusResponse.getStatus());
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElse(null);

            if (payment == null) {
                payment = Payment.builder()
                        .order(order)
                        .method(order.getPaymentMethod())
                        .transactionId(webhook.getTransactionId())
                        .amount(statusResponse.getAmount())
                        .status(paymentStatus)
                        .build();
                if (PaymentStatus.PAID.equals(paymentStatus)) {
                    payment.setPaidAt(LocalDateTime.now());
                }
            } else {
                payment.setStatus(paymentStatus);
                payment.setTransactionId(webhook.getTransactionId());
                if (PaymentStatus.PAID.equals(paymentStatus)) {
                    payment.setPaidAt(LocalDateTime.now());
                }
            }
            paymentRepository.save(payment);

            if (PaymentStatus.PAID.equals(paymentStatus)) {
                order.setPaymentStatus(PaymentStatus.PAID);
                orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
                log.info("Order {} payment confirmed via Sepay webhook", orderId);
            } else if (PaymentStatus.FAILED.equals(paymentStatus)) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
                log.warn("Order {} payment failed via Sepay webhook", orderId);
            }

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message("Sepay webhook processed successfully")
                    .data("OK")
                    .build());
        } catch (Exception e) {
            log.error("Error processing Sepay webhook", e);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(false)
                    .message("Error processing webhook: " + e.getMessage())
                    .data("FAILED")
                    .build());
        }
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
}
