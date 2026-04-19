package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.CartItemResponse;
import com.webtechnology.ecommerce.entity.CartItem;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductVariant;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-19T22:54:17+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Ubuntu)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public CartItemResponse toItemResponse(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartItemResponse.CartItemResponseBuilder cartItemResponse = CartItemResponse.builder();

        cartItemResponse.productId( cartItemProductVariantProductId( cartItem ) );
        cartItemResponse.productName( cartItemProductVariantProductName( cartItem ) );
        cartItemResponse.productVariantId( cartItemProductVariantId( cartItem ) );
        cartItemResponse.sku( cartItemProductVariantSku( cartItem ) );
        cartItemResponse.price( cartItemProductVariantPrice( cartItem ) );
        Map<String, Object> attributes = cartItemProductVariantAttributes( cartItem );
        Map<String, Object> map = attributes;
        if ( map != null ) {
            cartItemResponse.attributes( new LinkedHashMap<String, Object>( map ) );
        }
        cartItemResponse.id( cartItem.getId() );
        cartItemResponse.quantity( cartItem.getQuantity() );

        cartItemResponse.lineTotal( cartItem.getProductVariant().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())) );

        return cartItemResponse.build();
    }

    private UUID cartItemProductVariantProductId(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        UUID id = product.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String cartItemProductVariantProductName(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        String name = product.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID cartItemProductVariantId(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        UUID id = productVariant.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String cartItemProductVariantSku(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        String sku = productVariant.getSku();
        if ( sku == null ) {
            return null;
        }
        return sku;
    }

    private BigDecimal cartItemProductVariantPrice(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        BigDecimal price = productVariant.getPrice();
        if ( price == null ) {
            return null;
        }
        return price;
    }

    private Map<String, Object> cartItemProductVariantAttributes(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Map<String, Object> attributes = productVariant.getAttributes();
        if ( attributes == null ) {
            return null;
        }
        return attributes;
    }
}
