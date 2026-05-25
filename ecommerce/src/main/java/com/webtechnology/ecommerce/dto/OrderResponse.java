package com.webtechnology.ecommerce.dto;

import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private UUID addressId;
    private AddressResponse address;
    private BigDecimal totalAmount;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private String couponCode;
    private String orderCode;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
