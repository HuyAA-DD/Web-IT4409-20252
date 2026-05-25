package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.dto.DashboardResponse;
import java.util.List;
import java.util.UUID;

public interface SellerService {
    List<OrderResponse> getSellerOrders(UUID sellerId);
    OrderResponse getSellerOrderById(UUID sellerId, UUID orderId);
    DashboardResponse getSellerDashboard(UUID sellerId);
}
