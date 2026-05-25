package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.OrderItemResponse;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.mapper.OrderMapper;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.service.SellerService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerServiceImpl implements SellerService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;

    @Override
    public List<OrderResponse> getSellerOrders(UUID sellerId) {
        // Efficiently find all order items belonging to this seller using a database query
        List<OrderItem> sellerItems = orderItemRepository.findByProductSellerId(sellerId);

        return sellerItems.stream()
                .map(OrderItem::getOrder)
                .distinct()
                .map(order -> buildSellerOrderResponse(order, sellerId))
                .toList();
    }

    @Override
    public OrderResponse getSellerOrderById(UUID sellerId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.webtechnology.ecommerce.exception.ResourceNotFoundException("Order not found"));
        
        return buildSellerOrderResponse(order, sellerId);
    }

    @Override
    public DashboardResponse getSellerDashboard(UUID sellerId) {
        List<OrderResponse> sellerOrders = getSellerOrders(sellerId);
        
        long totalOrders = sellerOrders.size();
        BigDecimal totalRevenue = sellerOrders.stream()
                .map(order -> order.getItems().stream()
                        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // This is a simplified dashboard for now
        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalProducts((long) sellerOrders.stream()
                        .flatMap(o -> o.getItems().stream())
                        .map(OrderItemResponse::getProductId)
                        .distinct()
                        .count())
                .build();
    }

    private OrderResponse buildSellerOrderResponse(Order order, UUID sellerId) {
        List<OrderItem> allItems = orderItemRepository.findByOrderId(order.getId());
        
        // Only include items belonging to this seller
        List<OrderItemResponse> sellerItems = allItems.stream()
                .filter(item -> item.getProduct().getSeller().getId().equals(sellerId))
                .map(orderMapper::toOrderItemResponse)
                .toList();

        if (sellerItems.isEmpty()) {
            throw new com.webtechnology.ecommerce.exception.ResourceNotFoundException("No items found for this seller in this order");
        }

        OrderResponse response = orderMapper.toOrderResponse(order);
        response.setItems(sellerItems);
        
        // Recalculate totals for this seller's view? 
        // Usually, the seller wants to see the total amount they will receive.
        BigDecimal sellerSubtotal = sellerItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        response.setSubTotal(sellerSubtotal);
        response.setTotalAmount(sellerSubtotal); // Simplified: ignoring coupons/discounts for seller's sub-view for now
        
        return response;
    }
}
