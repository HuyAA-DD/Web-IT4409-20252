package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.ProductImage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductId(UUID productId);

    @Modifying
    @Query("UPDATE ProductImage i SET i.deleted = true WHERE i.product.id = :productId")
    void deleteByProductId(@Param("productId") UUID productId);
}
