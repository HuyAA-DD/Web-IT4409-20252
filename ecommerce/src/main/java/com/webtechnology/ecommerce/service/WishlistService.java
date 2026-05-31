package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.WishlistRequest;
import com.webtechnology.ecommerce.dto.WishlistResponse;
import java.util.List;
import java.util.UUID;

public interface WishlistService {

    WishlistResponse addToWishlist(WishlistRequest request);

    List<WishlistResponse> getAllWishlists();

    WishlistResponse getWishlistById(UUID id);

    List<WishlistResponse> getWishlistsByUserId(UUID userId);

    List<WishlistResponse> getWishlistsByProductId(UUID productId);

    void removeWishlistById(UUID id, UUID requesterId);

    void removeWishlistByUserId(UUID userId);

    void removeWishlistByUserIdAndProductId(UUID userId, UUID productId);
}
