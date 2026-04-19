package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.CartItemResponse;
import com.webtechnology.ecommerce.entity.CartItem;
import java.math.BigDecimal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = BigDecimal.class)
public interface CartMapper {

    @Mapping(target = "productId", source = "productVariant.product.id")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "productVariantId", source = "productVariant.id")
    @Mapping(target = "sku", source = "productVariant.sku")
    @Mapping(target = "price", source = "productVariant.price")
    @Mapping(target = "attributes", source = "productVariant.attributes")
    @Mapping(target = "lineTotal", expression = "java(cartItem.getProductVariant().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))")
    CartItemResponse toItemResponse(CartItem cartItem);
}
