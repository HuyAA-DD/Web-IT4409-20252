package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.OrderItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.id = :userId " +
           "AND oi.product.id = :productId " +
           "AND o.status = com.webtechnology.ecommerce.enums.OrderStatus.DELIVERED")
    boolean hasUserPurchasedProduct(@Param("userId") UUID userId, @Param("productId") UUID productId);
}
