package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.service.SellerService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getSellerOrders(Authentication authentication) {
        UUID sellerId = UUID.fromString(authentication.getName());
        List<OrderResponse> responses = sellerService.getSellerOrders(sellerId);
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Seller orders retrieved successfully")
                .data(responses)
                .build());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getSellerOrderById(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID sellerId = UUID.fromString(authentication.getName());
        OrderResponse response = sellerService.getSellerOrderById(sellerId, id);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Seller order details retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getSellerDashboard(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        UUID sellerId = UUID.fromString(authentication.getName());
        DashboardResponse response = sellerService.getSellerDashboard(sellerId, year, month, quarter);
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Seller dashboard data retrieved successfully")
                .data(response)
                .build());
    }
}
