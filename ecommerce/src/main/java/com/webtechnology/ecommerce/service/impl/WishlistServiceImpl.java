package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.WishlistRequest;
import com.webtechnology.ecommerce.dto.WishlistResponse;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.entity.Wishlist;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.WishlistMapper;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.repository.WishlistRepository;
import com.webtechnology.ecommerce.service.WishlistService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;

    @Override
    public WishlistResponse addToWishlist(WishlistRequest request) {
        if (wishlistRepository.existsByUserIdAndProductId(request.getUserId(), request.getProductId())) {
            throw new BadRequestException("Product already exists in wishlist");
        }

        Wishlist wishlist = wishlistMapper.toEntity(request);
        wishlist.setUser(findUserById(request.getUserId()));
        wishlist.setProduct(findProductById(request.getProductId()));

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishlistMapper.toResponse(savedWishlist);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getAllWishlists() {
        return wishlistRepository.findAll()
                .stream()
                .map(wishlistMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WishlistResponse getWishlistById(UUID id) {
        return wishlistMapper.toResponse(findWishlistById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlistsByUserId(UUID userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(wishlistMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlistsByProductId(UUID productId) {
        return wishlistRepository.findByProductId(productId)
                .stream()
                .map(wishlistMapper::toResponse)
                .toList();
    }

    @Override
    public void removeWishlistById(UUID id, UUID requesterId) {
        Wishlist wishlist = findWishlistById(id);
        if (!wishlist.getUser().getId().equals(requesterId)) {
            throw new com.webtechnology.ecommerce.exception.BadRequestException(
                    "You are not authorized to remove this wishlist item");
        }
        wishlistRepository.delete(wishlist);
    }

    @Override
    public void removeWishlistByUserId(UUID userId) {
        wishlistRepository.deleteByUserId(userId);
    }

    @Override
    public void removeWishlistByUserIdAndProductId(UUID userId, UUID productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Wishlist not found for user id: " + userId + " and product id: " + productId
            ));
        wishlistRepository.delete(wishlist);
    }

    private Wishlist findWishlistById(UUID id) {
        return wishlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found with id: " + id));
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Product findProductById(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }
}
