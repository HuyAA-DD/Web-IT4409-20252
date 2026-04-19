package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AddCartItemRequest;
import com.webtechnology.ecommerce.dto.CartItemResponse;
import com.webtechnology.ecommerce.dto.CartResponse;
import com.webtechnology.ecommerce.dto.UpdateCartItemRequest;
import com.webtechnology.ecommerce.entity.Cart;
import com.webtechnology.ecommerce.entity.CartItem;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.CartMapper;
import com.webtechnology.ecommerce.repository.CartItemRepository;
import com.webtechnology.ecommerce.repository.CartRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.CartService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse addItemToCart(UUID userId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        ProductVariant productVariant = findVariantById(request.getProductVariantId());

        validateStock(productVariant, request.getQuantity());

        CartItem cartItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), productVariant.getId())
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .productVariant(productVariant)
                        .quantity(0)
                        .build());

        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        validateStock(productVariant, newQuantity);
        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(UUID userId, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = findCartItemById(itemId);
        validateCartOwnership(cart, cartItem);
        validateStock(cartItem.getProductVariant(), request.getQuantity());

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeCartItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = findCartItemById(itemId);
        validateCartOwnership(cart, cartItem);
        cartItemRepository.delete(cartItem);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        return buildCartResponse(cart);
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> items = cartItemRepository.findByCartId(cart.getId())
                .stream()
                .map(cartMapper::toItemResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();
        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .createdAt(cart.getCreatedAt())
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .items(items)
                .build();
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .user(findUserById(userId))
                        .build()));
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private ProductVariant findVariantById(UUID variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + variantId));
    }

    private CartItem findCartItemById(UUID itemId) {
        return cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));
    }

    private void validateCartOwnership(Cart cart, CartItem cartItem) {
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to the specified user's cart");
        }
    }

    private void validateStock(ProductVariant productVariant, int quantity) {
        if (quantity > productVariant.getStock()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }
    }
}
