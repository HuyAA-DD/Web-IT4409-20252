package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.OrderRequest;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.enums.OrderStatus;
import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(UUID userId, OrderRequest request);

    List<OrderResponse> getUserOrders(UUID userId);

    OrderResponse getOrderById(UUID orderId);

    OrderResponse getOrderByIdAndUserId(UUID orderId, UUID userId);

    OrderResponse cancelOrder(UUID orderId, UUID userId);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderTracking(UUID orderId, UUID userId);
}
