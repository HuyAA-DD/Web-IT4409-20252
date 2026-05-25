package com.webtechnology.ecommerce.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.FileUploadResponse;
import com.webtechnology.ecommerce.dto.ProductRequest;
import com.webtechnology.ecommerce.dto.ProductResponse;
import com.webtechnology.ecommerce.enums.ProductStatus;
import com.webtechnology.ecommerce.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request,
            org.springframework.security.core.Authentication authentication) {
        UUID sellerId;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            sellerId = request.getSellerId() != null ? request.getSellerId() : UUID.fromString(authentication.getName());
        } else {
            sellerId = UUID.fromString(authentication.getName());
        }
        
        ProductResponse response = productService.createProduct(request, sellerId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product created successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
            .success(true)
            .message("Products retrieved successfully")
            .data(productService.getAllProducts())
            .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID sellerId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
            .success(true)
            .message("Products search results retrieved successfully")
            .data(productService.searchProducts(keyword, categoryId, sellerId, minPrice, maxPrice, sortBy, sortDir))
            .build());
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> filterProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) UUID sellerId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
            .success(true)
            .message("Products filter results retrieved successfully")
            .data(productService.filterProducts(categoryId, status, sellerId, minPrice, maxPrice, sortBy, sortDir))
            .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
            .success(true)
            .message("Product retrieved successfully")
            .data(productService.getProductById(id))
            .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        UUID sellerId;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            sellerId = request.getSellerId() != null ? request.getSellerId() : UUID.fromString(authentication.getName());
        } else {
            sellerId = UUID.fromString(authentication.getName());
        }

        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
            .success(true)
            .message("Product updated successfully")
            .data(productService.updateProduct(id, request, sellerId))
            .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
            .success(true)
            .message("Product deleted successfully")
            .data(null)
            .build());
    }

    @PostMapping("/{productId}/upload-image")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadProductImage(
            @PathVariable UUID productId,
            @RequestParam("file") MultipartFile file
    ) {
        FileUploadResponse response = productService.uploadProductImage(productId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.<FileUploadResponse>builder()
                .success(true)
                .message("Product image uploaded successfully")
                .data(response)
                .build());
    }

    @PostMapping("/{productId}/upload-images")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadProductImages(
            @PathVariable UUID productId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        List<FileUploadResponse> responses = productService.uploadProductImages(productId, files);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.<List<FileUploadResponse>>builder()
                .success(true)
                .message("Product images uploaded successfully")
                .data(responses)
                .build());
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId
    ) {
        productService.deleteProductImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
            .success(true)
            .message("Product image deleted successfully")
            .data(null)
            .build());
    }
}
