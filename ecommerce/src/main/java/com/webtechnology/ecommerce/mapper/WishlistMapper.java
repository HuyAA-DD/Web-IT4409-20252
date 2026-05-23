package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.WishlistRequest;
import com.webtechnology.ecommerce.dto.WishlistResponse;
import com.webtechnology.ecommerce.entity.Wishlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    WishlistResponse toResponse(Wishlist wishlist);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Wishlist toEntity(WishlistRequest request);
}
