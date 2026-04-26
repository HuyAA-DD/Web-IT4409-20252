package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.entity.Coupon;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T14:41:27+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CouponMapperImpl implements CouponMapper {

    @Override
    public CouponResponse toResponse(Coupon coupon) {
        if ( coupon == null ) {
            return null;
        }

        CouponResponse.CouponResponseBuilder couponResponse = CouponResponse.builder();

        couponResponse.code( coupon.getCode() );
        couponResponse.createdAt( coupon.getCreatedAt() );
        couponResponse.currentUsage( coupon.getCurrentUsage() );
        couponResponse.discountType( coupon.getDiscountType() );
        couponResponse.discountValue( coupon.getDiscountValue() );
        couponResponse.endDate( coupon.getEndDate() );
        couponResponse.id( coupon.getId() );
        couponResponse.isActive( coupon.getIsActive() );
        couponResponse.maxDiscount( coupon.getMaxDiscount() );
        couponResponse.minOrderValue( coupon.getMinOrderValue() );
        couponResponse.startDate( coupon.getStartDate() );
        couponResponse.updatedAt( coupon.getUpdatedAt() );
        couponResponse.usageLimit( coupon.getUsageLimit() );

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
        coupon.endDate( request.getEndDate() );
        coupon.isActive( request.getIsActive() );
        coupon.maxDiscount( request.getMaxDiscount() );
        coupon.minOrderValue( request.getMinOrderValue() );
        coupon.startDate( request.getStartDate() );
        coupon.usageLimit( request.getUsageLimit() );

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
        if ( request.getEndDate() != null ) {
            coupon.setEndDate( request.getEndDate() );
        }
        if ( request.getIsActive() != null ) {
            coupon.setIsActive( request.getIsActive() );
        }
        if ( request.getMaxDiscount() != null ) {
            coupon.setMaxDiscount( request.getMaxDiscount() );
        }
        if ( request.getMinOrderValue() != null ) {
            coupon.setMinOrderValue( request.getMinOrderValue() );
        }
        if ( request.getStartDate() != null ) {
            coupon.setStartDate( request.getStartDate() );
        }
        if ( request.getUsageLimit() != null ) {
            coupon.setUsageLimit( request.getUsageLimit() );
        }
    }
}
