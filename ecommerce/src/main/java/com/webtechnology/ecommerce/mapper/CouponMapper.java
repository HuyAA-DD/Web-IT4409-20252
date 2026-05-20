package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.entity.Coupon;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    CouponResponse toResponse(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentUsage", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coupon toEntity(CouponRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentUsage", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CouponRequest request, @MappingTarget Coupon coupon);
}
