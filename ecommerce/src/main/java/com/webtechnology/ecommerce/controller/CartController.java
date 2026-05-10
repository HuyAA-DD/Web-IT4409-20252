package com.webtechnology.ecommerce.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtechnology.ecommerce.dto.AddCartItemRequest;
import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.CartResponse;
import com.webtechnology.ecommerce.dto.UpdateCartItemRequest;
import com.webtechnology.ecommerce.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cart/{userId}")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','USER')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(cartService.getCartByUserId(userId))
                .build());
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addCartItem(
            @PathVariable UUID userId,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
            .success(true)
            .message("Cart item added successfully")
            .data(cartService.addItemToCart(userId, request))
            .build());
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable UUID userId,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
            .success(true)
            .message("Cart item updated successfully")
            .data(cartService.updateCartItem(userId, itemId, request))
            .build());
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @PathVariable UUID userId,
            @PathVariable UUID itemId
    ) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
            .success(true)
            .message("Cart item removed successfully")
            .data(cartService.removeCartItem(userId, itemId))
            .build());
    }

    @DeleteMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart cleared successfully")
                .data(cartService.clearCart(userId))
                .build());
    }
}
