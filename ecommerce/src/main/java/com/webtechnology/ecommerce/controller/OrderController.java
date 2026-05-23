package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.OrderRequest;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<OrderResponse>builder()
                        .success(true)
                        .message("Order created successfully")
                        .data(response)
                        .build());
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        List<OrderResponse> responses = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Orders retrieved successfully")
                .data(responses)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        OrderResponse response = orderService.getOrderByIdAndUserId(id, userId);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Order retrieved successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        OrderResponse response = orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Order cancelled successfully")
                .data(response)
                .build());
    }

    @GetMapping("/{id}/tracking")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderTracking(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        OrderResponse response = orderService.getOrderTracking(id, userId);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Order tracking information retrieved successfully")
                .data(response)
                .build());
    }
}
