package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.ProductVariant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductId(UUID productId);

    boolean existsBySku(String sku);

    void deleteByProductId(UUID productId);
}
