package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.RevenueResponse;
import com.webtechnology.ecommerce.dto.TopProductResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AdminService;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public DashboardResponse getDashboard() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        long pendingOrders = countOrdersByStatus(allOrders, OrderStatus.PENDING);
        long confirmedOrders = countOrdersByStatus(allOrders, OrderStatus.CONFIRMED);
        long processingOrders = countOrdersByStatus(allOrders, OrderStatus.PROCESSING);
        long shippedOrders = countOrdersByStatus(allOrders, OrderStatus.SHIPPED);
        long deliveredOrders = countOrdersByStatus(allOrders, OrderStatus.DELIVERED);
        long cancelledOrders = countOrdersByStatus(allOrders, OrderStatus.CANCELLED);

        // Calculate total revenue from delivered orders
        BigDecimal totalRevenue = allOrders.stream()
                .filter(order -> order.getStatus().equals(OrderStatus.DELIVERED))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();

        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .processingOrders(processingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .build();
    }

    @Override
    public RevenueResponse getRevenue() {
        List<Order> deliveredOrders = orderRepository.findByStatus(OrderStatus.DELIVERED);
        List<Order> allOrders = orderRepository.findAll();

        // Total revenue from delivered orders
        BigDecimal totalRevenue = deliveredOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Average order value
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (!allOrders.isEmpty()) {
            BigDecimal totalAllOrders = allOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            averageOrderValue = totalAllOrders.divide(BigDecimal.valueOf(allOrders.size()), BigDecimal.ROUND_HALF_UP);
        }

        // Net revenue (assuming no refunds yet)
        BigDecimal netRevenue = totalRevenue;

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .totalRefunds(BigDecimal.ZERO)
                .netRevenue(netRevenue)
                .build();
    }

    @Override
    public List<TopProductResponse> getTopProducts(int limit) {
        List<Order> deliveredOrders = orderRepository.findByStatus(OrderStatus.DELIVERED);

        return deliveredOrders.stream()
                .flatMap(order -> orderItemRepository.findByOrderId(order.getId()).stream())
                .collect(Collectors.groupingBy(
                        orderItem -> orderItem.getProduct(),
                        Collectors.summingLong(orderItem -> orderItem.getQuantity().longValue())
                ))
                .entrySet().stream()
                .map(entry -> TopProductResponse.builder()
                        .productId(entry.getKey().getId())
                        .productName(entry.getKey().getName())
                        .totalSales(entry.getValue())
                        .totalRevenue(
                                deliveredOrders.stream()
                                        .flatMap(order -> orderItemRepository.findByOrderId(order.getId()).stream())
                                        .filter(item -> item.getProduct().getId().equals(entry.getKey().getId()))
                                        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        )
                        .build()
                )
                .sorted((a, b) -> Long.compare(b.getTotalSales(), a.getTotalSales()))
                .limit(limit)
                .toList();
    }

    private long countOrdersByStatus(List<Order> orders, OrderStatus status) {
        return orders.stream()
                .filter(order -> order.getStatus().equals(status))
                .count();
    }
}
