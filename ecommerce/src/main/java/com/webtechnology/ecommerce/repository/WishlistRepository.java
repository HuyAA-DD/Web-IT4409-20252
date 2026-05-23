package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Wishlist;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> findByUserId(UUID userId);

    List<Wishlist> findByProductId(UUID productId);

    Optional<Wishlist> findByUserIdAndProductId(UUID userId, UUID productId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    void deleteByUserId(UUID userId);
}
