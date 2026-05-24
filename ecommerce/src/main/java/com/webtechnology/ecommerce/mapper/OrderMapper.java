package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.OrderItemResponse;
import com.webtechnology.ecommerce.dto.OrderResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.OrderItem;
import java.math.BigDecimal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = BigDecimal.class)
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "addressId", source = "address.id")
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "items", ignore = true)
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "productName")
    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "sku", source = "sku")
    @Mapping(target = "lineTotal", expression = "java(orderItem.getPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())))")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
