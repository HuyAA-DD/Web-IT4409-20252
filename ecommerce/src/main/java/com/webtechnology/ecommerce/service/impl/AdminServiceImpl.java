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
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
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
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        // Calculate total revenue from delivered orders using a custom query
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenueByStatus(OrderStatus.DELIVERED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

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
            averageOrderValue = totalAllOrders.divide(BigDecimal.valueOf(allOrders.size()), RoundingMode.HALF_UP);
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
        List<UUID> orderIds = deliveredOrders.stream().map(Order::getId).toList();
        
        if (orderIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<com.webtechnology.ecommerce.entity.OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);

        return allItems.stream()
                .collect(Collectors.groupingBy(
                        orderItem -> orderItem.getProduct(),
                        java.util.stream.Collector.of(
                                ProductStats::new,
                                (acc, item) -> {
                                    acc.count += item.getQuantity();
                                    acc.revenue = acc.revenue.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                                },
                                (acc1, acc2) -> {
                                    acc1.count += acc2.count;
                                    acc1.revenue = acc1.revenue.add(acc2.revenue);
                                    return acc1;
                                }
                        )
                ))
                .entrySet().stream()
                .map(entry -> TopProductResponse.builder()
                        .productId(entry.getKey().getId())
                        .productName(entry.getKey().getName())
                        .totalSales(entry.getValue().count)
                        .totalRevenue(entry.getValue().revenue)
                        .build()
                )
                .sorted((a, b) -> Long.compare(b.getTotalSales(), a.getTotalSales()))
                .limit(limit)
                .toList();
    }

    @lombok.Data
    private static class ProductStats {
        long count = 0;
        BigDecimal revenue = BigDecimal.ZERO;
    }

}
