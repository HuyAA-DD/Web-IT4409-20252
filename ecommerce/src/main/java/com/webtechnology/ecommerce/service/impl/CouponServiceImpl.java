package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.dto.CouponCalculationResponse;
import com.webtechnology.ecommerce.entity.Coupon;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.CouponMapper;
import com.webtechnology.ecommerce.repository.CouponRepository;
import com.webtechnology.ecommerce.service.CouponService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    @Override
    public CouponResponse createCoupon(CouponRequest request) {
        Coupon coupon = couponMapper.toEntity(request);
        Coupon savedCoupon = couponRepository.save(coupon);
        return couponMapper.toResponse(savedCoupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll()
                .stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(UUID id) {
        return couponMapper.toResponse(findCouponById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));
        return couponMapper.toResponse(coupon);
    }

    @Override
    public CouponResponse updateCoupon(UUID id, CouponRequest request) {
        Coupon existingCoupon = findCouponById(id);
        couponMapper.updateEntityFromRequest(request, existingCoupon);
        Coupon savedCoupon = couponRepository.save(existingCoupon);
        return couponMapper.toResponse(savedCoupon);
    }

    @Override
    public void deleteCoupon(UUID id) {
        Coupon coupon = findCouponById(id);
        couponRepository.delete(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponCalculationResponse applyCoupon(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));

        CouponCalculationResponse.CouponCalculationResponseBuilder response = CouponCalculationResponse.builder()
                .code(code)
                .originalAmount(orderAmount)
                .discountType(coupon.getDiscountType());

        // Validate coupon
        if (!coupon.getIsActive()) {
            return response
                    .isValid(false)
                    .message("Coupon is not active")
                    .finalAmount(orderAmount)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return response
                    .isValid(false)
                    .message("Coupon is not yet valid")
                    .finalAmount(orderAmount)
                    .build();
        }

        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            return response
                    .isValid(false)
                    .message("Coupon has expired")
                    .finalAmount(orderAmount)
                    .build();
        }

        if (coupon.getUsageLimit() != null && coupon.getCurrentUsage() >= coupon.getUsageLimit()) {
            return response
                    .isValid(false)
                    .message("Coupon usage limit reached")
                    .finalAmount(orderAmount)
                    .build();
        }

        if (coupon.getMinOrderValue() != null && orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            return response
                    .isValid(false)
                    .message("Order amount is below minimum required value")
                    .finalAmount(orderAmount)
                    .build();
        }

        // Calculate discount
        BigDecimal discountAmount = BigDecimal.ZERO;

        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = coupon.getDiscountValue();
        }

        // Apply max discount limit if set
        if (coupon.getMaxDiscount() != null && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
            discountAmount = coupon.getMaxDiscount();
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        // Increment usage count
        coupon.setCurrentUsage(coupon.getCurrentUsage() + 1);
        couponRepository.save(coupon);

        return response
                .isValid(true)
                .message("Coupon applied successfully")
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .build();
    }

    private Coupon findCouponById(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
    }
}

