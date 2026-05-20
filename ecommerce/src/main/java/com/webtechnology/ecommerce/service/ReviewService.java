package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.ReviewRequest;
import com.webtechnology.ecommerce.dto.ReviewResponse;
import java.util.List;
import java.util.UUID;

public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request);

    List<ReviewResponse> getAllReviews();

    ReviewResponse getReviewById(UUID id);

    List<ReviewResponse> getReviewsByProductId(UUID productId);

    List<ReviewResponse> getReviewsByUserId(UUID userId);

    ReviewResponse updateReview(UUID id, ReviewRequest request);

    void deleteReview(UUID id);
}
