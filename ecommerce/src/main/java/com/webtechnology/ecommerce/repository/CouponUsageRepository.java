package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.CouponUsage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {
    List<CouponUsage> findByUserId(UUID userId);
    List<CouponUsage> findByCouponId(UUID couponId);
    List<CouponUsage> findByOrderId(UUID orderId);
}
