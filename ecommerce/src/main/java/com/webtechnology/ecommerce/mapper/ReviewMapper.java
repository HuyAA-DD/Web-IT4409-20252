package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.ReviewRequest;
import com.webtechnology.ecommerce.dto.ReviewResponse;
import com.webtechnology.ecommerce.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public Review toEntity(ReviewRequest request) {
        if (request == null) {
            return null;
        }

        return Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
    }

    public void updateEntityFromRequest(ReviewRequest request, Review review) {
        if (request == null || review == null) {
            return;
        }
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }
    }
}
