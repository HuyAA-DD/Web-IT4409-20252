package com.webtechnology.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.FileUploadResponse;
import com.webtechnology.ecommerce.dto.ProductRequest;
import com.webtechnology.ecommerce.dto.ProductResponse;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(UUID id);

    ProductResponse updateProduct(UUID id, ProductRequest request);

    void deleteProduct(UUID id);

    FileUploadResponse uploadProductImage(UUID productId, MultipartFile file);

    List<FileUploadResponse> uploadProductImages(UUID productId, List<MultipartFile> files);

    void deleteProductImage(UUID productId, UUID imageId);
}
