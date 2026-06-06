package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.OrderItem;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    List<OrderItem> findByOrderIdIn(List<UUID> orderIds);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.id = :userId " +
           "AND oi.product.id = :productId " +
           "AND o.status = com.webtechnology.ecommerce.enums.OrderStatus.DELIVERED")
    boolean hasUserPurchasedProduct(@Param("userId") UUID userId, @Param("productId") UUID productId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.seller.id = :sellerId")
    List<OrderItem> findByProductSellerId(@Param("sellerId") UUID sellerId);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.paymentStatus = :paymentStatus")
    List<OrderItem> findByProductSellerIdAndOrderPaymentStatus(
            @Param("sellerId") UUID sellerId,
            @Param("paymentStatus") PaymentStatus paymentStatus);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.createdAt BETWEEN :startDate AND :endDate")
    List<OrderItem> findByProductSellerIdAndOrderCreatedAtBetween(
            @Param("sellerId") UUID sellerId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.paymentStatus = :paymentStatus " +
           "AND o.createdAt BETWEEN :startDate AND :endDate")
    List<OrderItem> findByProductSellerIdAndOrderPaymentStatusAndOrderCreatedAtBetween(
            @Param("sellerId") UUID sellerId,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}
