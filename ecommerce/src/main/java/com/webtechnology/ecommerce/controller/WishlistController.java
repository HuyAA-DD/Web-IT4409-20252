package com.webtechnology.ecommerce.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistService wishlistService;

    /** userId luôn lấy từ JWT */
    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @Valid @RequestBody WishlistRequest request,
            Authentication authentication) {
        request.setUserId(UUID.fromString(authentication.getName()));
        WishlistResponse response = wishlistService.addToWishlist(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WishlistResponse>builder()
                        .success(true)
                        .message("Wishlist item created successfully")
                        .data(response)
                        .build());
    }

    /** Lấy tất cả wishlist — chỉ ADMIN */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getAllWishlists() {
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getAllWishlists())
                .build());
    }

    /** Lấy wishlist của chính mình */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getMyWishlists(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getWishlistsByUserId(userId))
                .build());
    }

    /** Lấy wishlist của user bất kỳ — chỉ ADMIN */
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlistsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlists retrieved successfully")
                .data(wishlistService.getWishlistsByUserId(userId))
                .build());
    }

    /** Xóa item khỏi wishlist — chỉ owner */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeWishlistById(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        wishlistService.removeWishlistById(id, userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlist removed successfully")
                .data(null)
                .build());
    }

    /** Xóa toàn bộ wishlist của chính mình */
    @DeleteMapping("/my")
    public ResponseEntity<ApiResponse<Void>> removeMyWishlist(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        wishlistService.removeWishlistByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlists removed successfully")
                .data(null)
                .build());
    }

    /** Xóa sản phẩm cụ thể khỏi wishlist của chính mình */
    @DeleteMapping("/my/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromMyWishlist(
            @PathVariable UUID productId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        wishlistService.removeWishlistByUserIdAndProductId(userId, productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Wishlist removed successfully")
                .data(null)
                .build());
    }
}
