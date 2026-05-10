package com.webtechnology.ecommerce.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.PaymentResponse;
import com.webtechnology.ecommerce.dto.SepayCheckoutRequest;
import com.webtechnology.ecommerce.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/sepay/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> createSepayCheckout(
            @Valid @RequestBody SepayCheckoutRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        PaymentResponse response = paymentService.createSepayCheckout(userId, request);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Sepay checkout created successfully")
                .data(response)
                .build());
    }

    @GetMapping("/orders/{orderId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(
            @PathVariable UUID orderId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        PaymentResponse response = paymentService.getPaymentStatus(userId, orderId);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment status retrieved successfully")
                .data(response)
                .build());
    }
}
