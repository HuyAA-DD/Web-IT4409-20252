package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.ReviewRequest;
import com.webtechnology.ecommerce.dto.ReviewResponse;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.Review;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.ReviewMapper;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.ReviewRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.ReviewService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(request.getUserId(), request.getProductId())) {
            throw new BadRequestException("User has already reviewed this product");
        }

        Review review = reviewMapper.toEntity(request);
        review.setUser(findUserById(request.getUserId()));
        review.setProduct(findProductById(request.getProductId()));

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(UUID id) {
        return reviewMapper.toResponse(findReviewById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProductId(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUserId(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    public ReviewResponse updateReview(UUID id, ReviewRequest request) {
        Review existingReview = findReviewById(id);

        if (!existingReview.getUser().getId().equals(request.getUserId())) {
            throw new BadRequestException("Cannot update review of another user");
        }
        if (!existingReview.getProduct().getId().equals(request.getProductId())) {
            throw new BadRequestException("Cannot change product of an existing review");
        }

        reviewMapper.updateEntityFromRequest(request, existingReview);
        Review savedReview = reviewRepository.save(existingReview);
        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public void deleteReview(UUID id) {
        Review review = findReviewById(id);
        reviewRepository.delete(review);
    }

    private Review findReviewById(UUID id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
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
