package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.ProductResponse;
import com.webtechnology.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class PublicController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> globalSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .message("Global search results retrieved successfully")
                .data(productService.searchProducts(keyword, categoryId, null, minPrice, maxPrice, "createdAt", "desc"))
                .build());
    }
}
