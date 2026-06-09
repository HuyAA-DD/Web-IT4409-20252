package com.webtechnology.ecommerce.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.enums.ProductStatus;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    long countByStatus(ProductStatus status);

    List<Product> findTop8ByStatusOrderByCreatedAtDesc(ProductStatus status);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN ProductVariant v ON v.product = p WHERE "
            + "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND (:categoryId IS NULL OR p.category.id = :categoryId) "
            + "AND (:sellerId IS NULL OR p.seller.id = :sellerId) "
            + "AND (:status IS NULL OR p.status = :status) "
            + "AND (:minPrice IS NULL OR v.price >= :minPrice) "
            + "AND (:maxPrice IS NULL OR v.price <= :maxPrice)")
    List<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") UUID categoryId,
            @Param("sellerId") UUID sellerId,
            @Param("status") ProductStatus status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
}
