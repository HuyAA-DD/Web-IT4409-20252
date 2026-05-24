package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.OrderItemResponse;
import com.webtechnology.ecommerce.dto.OrderRequest;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.entity.Address;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.OrderMapper;
import com.webtechnology.ecommerce.repository.AddressRepository;
import com.webtechnology.ecommerce.repository.OrderItemRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.dto.CouponCalculationResponse;
import com.webtechnology.ecommerce.service.CouponService;
import com.webtechnology.ecommerce.service.OrderService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CouponService couponService;
    private final OrderMapper orderMapper;

    @Override
    public OrderResponse createOrder(UUID userId, OrderRequest request) {
        User user = findUserById(userId);
        Address address = findAddressById(request.getAddressId());

        // Validate that address belongs to the user
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to the user");
        }

        // Create order entity (pre-save to get ID if needed, but we can do it later)
        Order order = Order.builder()
                .user(user)
                .address(address)
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .build();

        // Save order first to get ID for items
        order = orderRepository.save(order);

        // Create order items and calculate subtotal
        BigDecimal subTotal = BigDecimal.ZERO;

        for (var itemRequest : request.getItems()) {
            ProductVariant variant = findProductVariantById(itemRequest.getProductVariantId());

            // Validate stock
            if (itemRequest.getQuantity() > variant.getStock()) {
                throw new BadRequestException("Insufficient stock for product variant: " + variant.getId());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(variant.getProduct())
                    .productVariant(variant)
                    .price(variant.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .build();

            orderItemRepository.save(orderItem);

            // Add to subtotal
            subTotal = subTotal.add(
                    variant.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );

            // Reduce stock
            variant.setStock(variant.getStock() - itemRequest.getQuantity());
            productVariantRepository.save(variant);
        }

        BigDecimal totalAmount = subTotal;
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponCalculationResponse couponResult = couponService.calculateDiscount(request.getCouponCode(), subTotal);
            if (couponResult.getIsValid()) {
                discountAmount = couponResult.getDiscountAmount();
                totalAmount = couponResult.getFinalAmount();
                order.setCouponCode(request.getCouponCode());
                order.setDiscountAmount(discountAmount);
                
                // Record usage AFTER order is successful (this is inside a transaction)
                couponService.recordUsage(request.getCouponCode(), userId, order.getId());
            } else {
                // Optionally throw error or just ignore invalid coupon
                throw new BadRequestException("Invalid coupon: " + couponResult.getMessage());
            }
        }

        order.setSubTotal(subTotal);
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(UUID userId) {
        findUserById(userId); // Validate user exists
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

        // Only allow cancellation for PENDING or CONFIRMED orders
        if (!order.getStatus().equals(OrderStatus.PENDING) && !order.getStatus().equals(OrderStatus.CONFIRMED)) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getStatus());
        }

        // Restore stock for all items
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            ProductVariant variant = item.getProductVariant();
            variant.setStock(variant.getStock() + item.getQuantity());
            productVariantRepository.save(variant);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        return buildOrderResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = findOrderById(orderId);

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::buildOrderResponse)
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
        List<OrderItemResponse> itemResponses = items.stream()
                .map(orderMapper::toOrderItemResponse)
                .toList();

        OrderResponse response = orderMapper.toOrderResponse(order);
        response.setItems(itemResponses);
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
        // Define valid transitions
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
