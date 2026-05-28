package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.AdminOrderResponse;
import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.RevenueResponse;
import com.webtechnology.ecommerce.dto.TopProductResponse;
import com.webtechnology.ecommerce.dto.UpdateOrderStatusRequest;
import com.webtechnology.ecommerce.service.AdminService;
import com.webtechnology.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        DashboardResponse response = adminService.getDashboard(year, month, quarter);
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Dashboard data retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueResponse>> getRevenue(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        RevenueResponse response = adminService.getRevenue(year, month, quarter);
        return ResponseEntity.ok(ApiResponse.<RevenueResponse>builder()
                .success(true)
                .message("Revenue data retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        List<TopProductResponse> response = adminService.getTopProducts(limit, year, month, quarter);
        return ResponseEntity.ok(ApiResponse.<List<TopProductResponse>>builder()
                .success(true)
                .message("Top products retrieved successfully")
                .data(response)
                .build());
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<AdminOrderResponse>>> getAllOrders() {
        // Get all orders and convert to AdminOrderResponse
        var orders = orderService.getAllOrders();
        List<AdminOrderResponse> adminOrders = orders.stream()
                .map(order -> AdminOrderResponse.builder()
                        .id(order.getId())
                        .userId(order.getUserId())
                        .userName(order.getUserName())
                        .addressId(order.getAddressId())
                        .address(order.getAddress())
                        .totalAmount(order.getTotalAmount())
                        .subTotal(order.getSubTotal())
                        .discountAmount(order.getDiscountAmount())
                        .couponCode(order.getCouponCode())
                        .status(order.getStatus())
                        .paymentStatus(order.getPaymentStatus())
                        .paymentMethod(order.getPaymentMethod())
                        .items(order.getItems())
                        .createdAt(order.getCreatedAt())
                        .build()
                )
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<AdminOrderResponse>>builder()
                .success(true)
                .message("All orders retrieved successfully")
                .data(adminOrders)
                .build());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        var order = orderService.updateOrderStatus(id, request.getStatus());
        AdminOrderResponse adminOrder = AdminOrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .userName(order.getUserName())
                .addressId(order.getAddressId())
                .address(order.getAddress())
                .totalAmount(order.getTotalAmount())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .items(order.getItems())
                .createdAt(order.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.<AdminOrderResponse>builder()
                .success(true)
                .message("Order status updated successfully")
                .data(adminOrder)
                .build());
    }
}
