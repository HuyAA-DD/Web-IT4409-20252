package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.ProductImage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductId(UUID productId);

    void deleteByProductId(UUID productId);
}
