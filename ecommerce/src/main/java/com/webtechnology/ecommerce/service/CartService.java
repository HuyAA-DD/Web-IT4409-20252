package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.AddCartItemRequest;
import com.webtechnology.ecommerce.dto.CartResponse;
import com.webtechnology.ecommerce.dto.UpdateCartItemRequest;
import java.util.UUID;

public interface CartService {

    CartResponse getCartByUserId(UUID userId);

    CartResponse addItemToCart(UUID userId, AddCartItemRequest request);

    CartResponse updateCartItem(UUID userId, UUID itemId, UpdateCartItemRequest request);

    CartResponse removeCartItem(UUID userId, UUID itemId);

    CartResponse clearCart(UUID userId);
}
