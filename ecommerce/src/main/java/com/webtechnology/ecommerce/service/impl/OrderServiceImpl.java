package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AuditLogRequest;
import com.webtechnology.ecommerce.dto.CouponCalculationResponse;
import com.webtechnology.ecommerce.dto.NotificationRequest;
import com.webtechnology.ecommerce.dto.OrderItemResponse;
import com.webtechnology.ecommerce.dto.OrderRequest;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.entity.Address;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.AddressMapper;
import com.webtechnology.ecommerce.mapper.OrderMapper;
import com.webtechnology.ecommerce.repository.AddressRepository;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AuditLogService;
import com.webtechnology.ecommerce.service.CouponService;
import com.webtechnology.ecommerce.service.NotificationService;
import com.webtechnology.ecommerce.service.OrderService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final String SELLER_ORDER_NOTIFICATION_TYPE = "SELLER_ORDER";
    private static final String SALE_PAID_NOTIFICATION_TYPE = "SALE_PAID";

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CouponService couponService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final OrderMapper orderMapper;
    private final AddressMapper addressMapper;

    @Override
    public OrderResponse createOrder(UUID userId, OrderRequest request) {
        User user = findUserById(userId);

        Address address = findAddressById(request.getAddressId());

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to the user");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order items cannot be empty");
        }

        Order order = Order.builder()
                .user(user)
                .address(address)
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .subTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> savedOrderItems = new ArrayList<>();

        for (var itemRequest : request.getItems()) {
            ProductVariant variant = findProductVariantById(itemRequest.getProductVariantId());

            if (itemRequest.getQuantity() > variant.getStock()) {
                throw new BadRequestException(
                        "Insufficient stock for product variant: " + variant.getId()
                );
            }

            BigDecimal lineTotal = variant.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(variant.getProduct())
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .sku(variant.getSku())
                    .price(variant.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .build();

            savedOrderItems.add(orderItemRepository.save(orderItem));

            subTotal = subTotal.add(lineTotal);

            variant.setStock(variant.getStock() - itemRequest.getQuantity());
            productVariantRepository.save(variant);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponCalculationResponse couponResult =
                    couponService.calculateDiscount(request.getCouponCode(), subTotal);

            if (couponResult.getIsValid()) {
                discountAmount = couponResult.getDiscountAmount();
                totalAmount = couponResult.getFinalAmount();

                order.setCouponCode(request.getCouponCode());
                order.setDiscountAmount(discountAmount);

                couponService.recordUsage(request.getCouponCode(), userId, order.getId());
            } else {
                throw new BadRequestException("Invalid coupon: " + couponResult.getMessage());
            }
        }

        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);

        createSellerOrderCreatedNotifications(order, savedOrderItems);
        createOrderCreatedNotification(order);

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(UUID userId) {
        findUserById(userId);
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::buildOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = findOrderById(orderId);
        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAndUserId(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for user"));
        return buildOrderResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for user"));

        return updateOrderStatusInternal(order, OrderStatus.CANCELLED);
    }

    @Override
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = findOrderById(orderId);
        return updateOrderStatusInternal(order, newStatus);
    }

    private OrderResponse updateOrderStatusInternal(Order order, OrderStatus newStatus) {
        UUID orderId = order.getId();
        OrderStatus oldStatus = order.getStatus();
        PaymentStatus oldPaymentStatus = order.getPaymentStatus();

        if (order.getStatus().equals(newStatus)) {
            return buildOrderResponse(order);
        }

        validateStatusTransition(order.getStatus(), newStatus);

        if (newStatus.equals(OrderStatus.CANCELLED)) {
            restoreStock(orderId);
        }

        order.setStatus(newStatus);
        markCodOrderAsPaidWhenDelivered(order, newStatus);
        Order savedOrder = orderRepository.save(order);

        auditLogService.createAuditLog(AuditLogRequest.builder()
                .action("UPDATE_ORDER_STATUS")
                .entityType("ORDER")
                .entityId(orderId)
                .oldValue(oldStatus.name())
                .newValue(newStatus.name())
                .build());

        createOrderStatusNotification(savedOrder, oldStatus, newStatus);

        if (!PaymentStatus.PAID.equals(oldPaymentStatus)
                && PaymentStatus.PAID.equals(savedOrder.getPaymentStatus())) {
            createSellerPaidNotifications(savedOrder);
        }

        return buildOrderResponse(savedOrder);
    }

    @Override
    public void notifySellerOrderPaid(UUID orderId) {
        Order order = findOrderById(orderId);

        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            createSellerPaidNotifications(order);
        }
    }

    private void markCodOrderAsPaidWhenDelivered(Order order, OrderStatus newStatus) {
        if (OrderStatus.DELIVERED.equals(newStatus)
                && PaymentMethod.COD.equals(order.getPaymentMethod())
                && !PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
    }

    private void createOrderCreatedNotification(Order order) {
        notificationService.createOrderNotification(
                order.getUser().getId(),
                order.getId(),
                "Đặt hàng thành công",
                "Đơn hàng " + getOrderDisplayCode(order)
                        + " đã được tạo thành công và đang chờ xác nhận."
        );
    }

    private void createSellerOrderCreatedNotifications(Order order, List<OrderItem> orderItems) {
        createSellerNotificationsByOrderItems(
                order,
                orderItems,
                SELLER_ORDER_NOTIFICATION_TYPE,
                "Đơn hàng mới có sản phẩm của bạn",
                " vừa được tạo với "
        );
    }

    private void createSellerPaidNotifications(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        createSellerNotificationsByOrderItems(
                order,
                orderItems,
                SALE_PAID_NOTIFICATION_TYPE,
                null,
                " đã được ghi nhận thanh toán với "
        );
    }

    private void createSellerNotificationsByOrderItems(
            Order order,
            List<OrderItem> orderItems,
            String notificationType,
            String fixedTitle,
            String messageVerb
    ) {
        Map<UUID, List<OrderItem>> itemsBySellerId = orderItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getSeller().getId()));

        itemsBySellerId.forEach((sellerId, sellerItems) -> {
            int soldQuantity = sellerItems.stream()
                    .mapToInt(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                    .sum();

            if (soldQuantity <= 0) {
                return;
            }

            String productSummary = sellerItems.stream()
                    .map(item -> item.getProductName() + " x" + item.getQuantity())
                    .collect(Collectors.joining(", "));

            String title = fixedTitle != null
                    ? fixedTitle
                    : "Bạn vừa bán thêm " + soldQuantity + " sản phẩm";

            notificationService.createNotification(NotificationRequest.builder()
                    .userId(sellerId)
                    .title(title)
                    .message("Đơn hàng " + getOrderDisplayCode(order)
                            + messageVerb + soldQuantity + " sản phẩm từ gian hàng của bạn: "
                            + productSummary + ".")
                    .type(notificationType)
                    .relatedEntityType("ORDER")
                    .relatedEntityId(order.getId())
                    .build());
        });
    }

    private void createOrderStatusNotification(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        notificationService.createOrderNotification(
                order.getUser().getId(),
                order.getId(),
                "Trạng thái đơn hàng đã thay đổi",
                "Đơn hàng " + getOrderDisplayCode(order)
                        + " đã chuyển từ " + getOrderStatusText(oldStatus)
                        + " sang " + getOrderStatusText(newStatus) + "."
        );
    }

    private String getOrderDisplayCode(Order order) {
        return order.getOrderCode() != null ? "#" + order.getOrderCode() : "#" + order.getId();
    }

    private String getOrderStatusText(OrderStatus status) {
        if (status == null) {
            return "Không xác định";
        }

        return switch (status) {
            case PENDING -> "chờ xử lý";
            case CONFIRMED -> "đã xác nhận";
            case PROCESSING -> "đang xử lý";
            case SHIPPED -> "đang giao";
            case DELIVERED -> "đã giao";
            case CANCELLED -> "đã hủy";
        };
    }

    private void restoreStock(UUID orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            ProductVariant variant = item.getProductVariant();
            if (variant != null) {
                variant.setStock(variant.getStock() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithDetails();
        List<UUID> orderIds = orders.stream().map(Order::getId).toList();
        
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        
        Map<UUID, List<OrderItem>> itemsByOrderId = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));
        
        return orders.stream()
                .map(order -> {
                    List<OrderItem> items = itemsByOrderId.getOrDefault(order.getId(), List.of());
                    return buildOrderResponse(order, items);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderTracking(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for user"));
        return buildOrderResponse(order);
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        return buildOrderResponse(order, items);
    }

    private OrderResponse buildOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(orderMapper::toOrderItemResponse)
                .toList();

        OrderResponse response = orderMapper.toOrderResponse(order);
        response.setItems(itemResponses);

        if (order.getAddress() != null) {
            response.setAddress(addressMapper.toResponse(order.getAddress()));
        }

        return response;
    }
    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Address findAddressById(UUID addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
    }

    private ProductVariant findProductVariantById(UUID variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + variantId));
    }

    private Order findOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        switch (currentStatus) {
            case PENDING:
                if (!newStatus.equals(OrderStatus.CONFIRMED) && !newStatus.equals(OrderStatus.CANCELLED)) {
                    throw new BadRequestException("Invalid status transition from PENDING to " + newStatus);
                }
                break;
            case CONFIRMED:
                if (!newStatus.equals(OrderStatus.PROCESSING) && !newStatus.equals(OrderStatus.CANCELLED)) {
                    throw new BadRequestException("Invalid status transition from CONFIRMED to " + newStatus);
                }
                break;
            case PROCESSING:
                if (!newStatus.equals(OrderStatus.SHIPPED)) {
                    throw new BadRequestException("Invalid status transition from PROCESSING to " + newStatus);
                }
                break;
            case SHIPPED:
                if (!newStatus.equals(OrderStatus.DELIVERED)) {
                    throw new BadRequestException("Invalid status transition from SHIPPED to " + newStatus);
                }
                break;
            case DELIVERED:
            case CANCELLED:
                throw new BadRequestException("Cannot transition from " + currentStatus + " status");
            default:
                throw new BadRequestException("Unknown order status: " + currentStatus);
        }
    }
}
