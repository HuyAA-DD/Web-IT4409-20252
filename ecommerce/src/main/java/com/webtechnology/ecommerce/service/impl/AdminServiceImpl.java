package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.RevenueResponse;
import com.webtechnology.ecommerce.dto.TopProductResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AdminService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import lombok.Data;
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
    public DashboardResponse getDashboard(Integer year, Integer month, Integer quarter) {
        if (year == null && month == null && quarter == null) {
            return getAllTimeDashboard();
        }

        LocalDateTime[] range = calculateDateRange(year, month, quarter);
        LocalDateTime start = range[0];
        LocalDateTime end = range[1];

        long totalOrders = orderRepository.countByCreatedAtBetween(start, end);
        long pendingOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.PENDING, start, end);
        long confirmedOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CONFIRMED, start, end);
        long processingOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.PROCESSING, start, end);
        long shippedOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.SHIPPED, start, end);
        long deliveredOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, start, end);
        long cancelledOrders = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CANCELLED, start, end);

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenueByStatusAndDateBetween(OrderStatus.DELIVERED, start, end);
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

    private DashboardResponse getAllTimeDashboard() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenueByStatus(OrderStatus.DELIVERED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .processingOrders(processingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .build();
    }

    @Override
    public RevenueResponse getRevenue(Integer year, Integer month, Integer quarter) {
        List<Order> deliveredOrders;
        if (year == null && month == null && quarter == null) {
            deliveredOrders = orderRepository.findByStatus(OrderStatus.DELIVERED);
        } else {
            LocalDateTime[] range = calculateDateRange(year, month, quarter);
            deliveredOrders = orderRepository.findByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, range[0], range[1]);
        }

        BigDecimal totalRevenue = deliveredOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (!deliveredOrders.isEmpty()) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(deliveredOrders.size()), RoundingMode.HALF_UP);
        }

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .totalRefunds(BigDecimal.ZERO)
                .netRevenue(totalRevenue)
                .build();
    }

    @Override
    public List<TopProductResponse> getTopProducts(int limit, Integer year, Integer month, Integer quarter) {
        List<Order> deliveredOrders;
        if (year == null && month == null && quarter == null) {
            deliveredOrders = orderRepository.findByStatus(OrderStatus.DELIVERED);
        } else {
            LocalDateTime[] range = calculateDateRange(year, month, quarter);
            deliveredOrders = orderRepository.findByStatusAndCreatedAtBetween(OrderStatus.DELIVERED, range[0], range[1]);
        }
        
        List<UUID> orderIds = deliveredOrders.stream().map(Order::getId).toList();
        
        if (orderIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);

        return allItems.stream()
                .collect(Collectors.groupingBy(
                        OrderItem::getProduct,
                        Collector.of(
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

    private LocalDateTime[] calculateDateRange(Integer year, Integer month, Integer quarter) {
        if (year == null) year = LocalDate.now().getYear();
        
        LocalDateTime start;
        LocalDateTime end;

        if (month != null) {
            start = LocalDateTime.of(year, month, 1, 0, 0);
            end = LocalDateTime.of(year, month, YearMonth.of(year, month).lengthOfMonth(), 23, 59, 59);
        } else if (quarter != null) {
            int startMonth = (quarter - 1) * 3 + 1;
            start = LocalDateTime.of(year, startMonth, 1, 0, 0);
            int endMonth = startMonth + 2;
            end = LocalDateTime.of(year, endMonth, YearMonth.of(year, endMonth).lengthOfMonth(), 23, 59, 59);
        } else {
            start = LocalDateTime.of(year, 1, 1, 0, 0);
            end = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        }

        return new LocalDateTime[]{start, end};
    }

    @Data
    private static class ProductStats {
        long count = 0;
        BigDecimal revenue = BigDecimal.ZERO;
    }
}
