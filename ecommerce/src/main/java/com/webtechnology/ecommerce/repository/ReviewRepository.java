package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProductIdOrderByCreatedAtDesc(UUID productId);

    List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}
