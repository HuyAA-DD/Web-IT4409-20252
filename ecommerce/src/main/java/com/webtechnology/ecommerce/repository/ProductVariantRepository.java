package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.ProductVariant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductId(UUID productId);

    boolean existsBySku(String sku);

    @Modifying
    @Query(value = "UPDATE product_variants SET deleted = true, sku = CONCAT(sku, '_del_', UUID()) WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") UUID productId);
}
