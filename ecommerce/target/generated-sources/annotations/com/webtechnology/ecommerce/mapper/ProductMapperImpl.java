package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.ProductRequest;
import com.webtechnology.ecommerce.dto.ProductResponse;
import com.webtechnology.ecommerce.dto.ProductVariantRequest;
import com.webtechnology.ecommerce.dto.ProductVariantResponse;
import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.User;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T14:41:28+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponse toResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.categoryId( productCategoryId( product ) );
        productResponse.categoryName( productCategoryName( product ) );
        productResponse.sellerId( productSellerId( product ) );
        productResponse.sellerName( productSellerFullName( product ) );
        productResponse.createdAt( product.getCreatedAt() );
        productResponse.description( product.getDescription() );
        productResponse.id( product.getId() );
        productResponse.name( product.getName() );
        productResponse.status( product.getStatus() );
        productResponse.updatedAt( product.getUpdatedAt() );

        return productResponse.build();
    }

    @Override
    public ProductVariantResponse toVariantResponse(ProductVariant productVariant) {
        if ( productVariant == null ) {
            return null;
        }

        ProductVariantResponse.ProductVariantResponseBuilder productVariantResponse = ProductVariantResponse.builder();

        Map<String, Object> map = productVariant.getAttributes();
        if ( map != null ) {
            productVariantResponse.attributes( new LinkedHashMap<String, Object>( map ) );
        }
        productVariantResponse.id( productVariant.getId() );
        productVariantResponse.price( productVariant.getPrice() );
        productVariantResponse.sku( productVariant.getSku() );
        productVariantResponse.stock( productVariant.getStock() );

        return productVariantResponse.build();
    }

    @Override
    public Product toEntity(ProductRequest request) {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.description( request.getDescription() );
        product.name( request.getName() );
        product.status( request.getStatus() );

        return product.build();
    }

    @Override
    public void updateEntityFromRequest(ProductRequest request, Product product) {
        if ( request == null ) {
            return;
        }

        if ( request.getDescription() != null ) {
            product.setDescription( request.getDescription() );
        }
        if ( request.getName() != null ) {
            product.setName( request.getName() );
        }
        if ( request.getStatus() != null ) {
            product.setStatus( request.getStatus() );
        }
    }

    @Override
    public ProductVariant toVariantEntity(ProductVariantRequest request) {
        if ( request == null ) {
            return null;
        }

        ProductVariant.ProductVariantBuilder productVariant = ProductVariant.builder();

        Map<String, Object> map = request.getAttributes();
        if ( map != null ) {
            productVariant.attributes( new LinkedHashMap<String, Object>( map ) );
        }
        productVariant.price( request.getPrice() );
        productVariant.sku( request.getSku() );
        productVariant.stock( request.getStock() );

        return productVariant.build();
    }

    private UUID productCategoryId(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        UUID id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String productCategoryName(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        String name = category.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID productSellerId(Product product) {
        if ( product == null ) {
            return null;
        }
        User seller = product.getSeller();
        if ( seller == null ) {
            return null;
        }
        UUID id = seller.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String productSellerFullName(Product product) {
        if ( product == null ) {
            return null;
        }
        User seller = product.getSeller();
        if ( seller == null ) {
            return null;
        }
        String fullName = seller.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
