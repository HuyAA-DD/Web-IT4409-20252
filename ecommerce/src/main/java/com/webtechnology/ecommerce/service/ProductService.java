package com.webtechnology.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.FileUploadResponse;
import com.webtechnology.ecommerce.dto.ProductRequest;
import com.webtechnology.ecommerce.dto.ProductResponse;
import com.webtechnology.ecommerce.enums.ProductStatus;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> searchProducts(String keyword, UUID categoryId, UUID sellerId,
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String sortDir);

    List<ProductResponse> filterProducts(UUID categoryId, ProductStatus status, UUID sellerId,
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String sortDir);

    ProductResponse getProductById(UUID id);

    ProductResponse updateProduct(UUID id, ProductRequest request);

    void deleteProduct(UUID id);

    FileUploadResponse uploadProductImage(UUID productId, MultipartFile file);

    List<FileUploadResponse> uploadProductImages(UUID productId, List<MultipartFile> files);

    void deleteProductImage(UUID productId, UUID imageId);
}
