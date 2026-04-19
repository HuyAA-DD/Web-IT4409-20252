package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.entity.Coupon;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-19T22:44:18+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Ubuntu)"
)
@Component
public class CouponMapperImpl implements CouponMapper {

    @Override
    public CouponResponse toResponse(Coupon coupon) {
        if ( coupon == null ) {
            return null;
        }

        CouponResponse.CouponResponseBuilder couponResponse = CouponResponse.builder();

        couponResponse.id( coupon.getId() );
        couponResponse.code( coupon.getCode() );
        couponResponse.discountType( coupon.getDiscountType() );
        couponResponse.discountValue( coupon.getDiscountValue() );
        couponResponse.minOrderValue( coupon.getMinOrderValue() );
        couponResponse.maxDiscount( coupon.getMaxDiscount() );
        couponResponse.startDate( coupon.getStartDate() );
        couponResponse.endDate( coupon.getEndDate() );
        couponResponse.usageLimit( coupon.getUsageLimit() );
        couponResponse.currentUsage( coupon.getCurrentUsage() );
        couponResponse.isActive( coupon.getIsActive() );
        couponResponse.createdAt( coupon.getCreatedAt() );
        couponResponse.updatedAt( coupon.getUpdatedAt() );

        return couponResponse.build();
    }

    @Override
    public Coupon toEntity(CouponRequest request) {
        if ( request == null ) {
            return null;
        }

        Coupon.CouponBuilder coupon = Coupon.builder();

        coupon.code( request.getCode() );
        coupon.discountType( request.getDiscountType() );
        coupon.discountValue( request.getDiscountValue() );
        coupon.minOrderValue( request.getMinOrderValue() );
        coupon.maxDiscount( request.getMaxDiscount() );
        coupon.startDate( request.getStartDate() );
        coupon.endDate( request.getEndDate() );
        coupon.usageLimit( request.getUsageLimit() );
        coupon.isActive( request.getIsActive() );

        return coupon.build();
    }

    @Override
    public void updateEntityFromRequest(CouponRequest request, Coupon coupon) {
        if ( request == null ) {
            return;
        }

        if ( request.getCode() != null ) {
            coupon.setCode( request.getCode() );
        }
        if ( request.getDiscountType() != null ) {
            coupon.setDiscountType( request.getDiscountType() );
        }
        if ( request.getDiscountValue() != null ) {
            coupon.setDiscountValue( request.getDiscountValue() );
        }
        if ( request.getMinOrderValue() != null ) {
            coupon.setMinOrderValue( request.getMinOrderValue() );
        }
        if ( request.getMaxDiscount() != null ) {
            coupon.setMaxDiscount( request.getMaxDiscount() );
        }
        if ( request.getStartDate() != null ) {
            coupon.setStartDate( request.getStartDate() );
        }
        if ( request.getEndDate() != null ) {
            coupon.setEndDate( request.getEndDate() );
        }
        if ( request.getUsageLimit() != null ) {
            coupon.setUsageLimit( request.getUsageLimit() );
        }
        if ( request.getIsActive() != null ) {
            coupon.setIsActive( request.getIsActive() );
        }
    }
}
