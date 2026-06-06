package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.OrderItemResponse;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.mapper.OrderMapper;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.service.SellerService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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
    public DashboardResponse getSellerDashboard(UUID sellerId, Integer year, Integer month, Integer quarter) {
        List<OrderItem> sellerItems;
        if (year == null && month == null && quarter == null) {
            sellerItems = orderItemRepository.findByProductSellerIdAndOrderPaymentStatus(sellerId, PaymentStatus.PAID);
        } else {
            LocalDateTime[] range = calculateDateRange(year, month, quarter);
            sellerItems = orderItemRepository.findByProductSellerIdAndOrderPaymentStatusAndOrderCreatedAtBetween(
                    sellerId,
                    PaymentStatus.PAID,
                    range[0],
                    range[1]
            );
        }
        
        long totalOrders = sellerItems.stream()
                .map(item -> item.getOrder().getId())
                .distinct()
                .count();

        BigDecimal totalRevenue = sellerItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalProducts = sellerItems.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .count();

        return DashboardResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalProducts(totalProducts)
                .build();
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
