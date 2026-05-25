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
    @Query("UPDATE ProductVariant v SET v.deleted = true, v.sku = CONCAT(v.sku, '_del_', v.id) WHERE v.product.id = :productId")
    void deleteByProductId(@Param("productId") UUID productId);
}
