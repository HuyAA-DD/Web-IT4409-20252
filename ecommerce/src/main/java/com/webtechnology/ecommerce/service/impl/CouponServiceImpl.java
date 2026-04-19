package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.entity.Coupon;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.CouponMapper;
import com.webtechnology.ecommerce.repository.CouponRepository;
import com.webtechnology.ecommerce.service.CouponService;
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

    private Coupon findCouponById(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
    }
}
