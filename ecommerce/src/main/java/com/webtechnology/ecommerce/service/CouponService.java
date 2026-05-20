package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.dto.CouponCalculationResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CouponService {

    CouponResponse createCoupon(CouponRequest request);

    List<CouponResponse> getAllCoupons();

    CouponResponse getCouponById(UUID id);

    CouponResponse getCouponByCode(String code);

    CouponResponse updateCoupon(UUID id, CouponRequest request);

    void deleteCoupon(UUID id);

    CouponCalculationResponse applyCoupon(String code, BigDecimal orderAmount);
}

