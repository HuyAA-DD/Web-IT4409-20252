package com.webtechnology.ecommerce.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.WishlistRequest;
import com.webtechnology.ecommerce.dto.WishlistResponse;
import com.webtechnology.ecommerce.service.WishlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','USER')")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(@Valid @RequestBody WishlistRequest request) {
        WishlistResponse response = wishlistService.addToWishlist(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WishlistResponse>builder()
                        .success(true)
                        .message("Wishlist item created successfully")
                        .data(response)
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getAllWishlists() {
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getAllWishlists())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlistById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<WishlistResponse>builder()
                .success(true)
                .message("Wishlist retrieved successfully")
                .data(wishlistService.getWishlistById(id))
                .build());
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlistsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getWishlistsByUserId(userId))
                .build());
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlistsByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getWishlistsByProductId(productId))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeWishlistById(@PathVariable UUID id) {
        wishlistService.removeWishlistById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlist removed successfully")
                .data(null)
                .build());
    }

    @DeleteMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeWishlistByUserId(@PathVariable UUID userId) {
        wishlistService.removeWishlistByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlists removed successfully")
                .data(null)
                .build());
    }

    @DeleteMapping("/by-user/{userId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeWishlistByUserIdAndProductId(
            @PathVariable UUID userId,
            @PathVariable UUID productId
    ) {
        wishlistService.removeWishlistByUserIdAndProductId(userId, productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlist removed successfully")
                .data(null)
                .build());
    }
}
