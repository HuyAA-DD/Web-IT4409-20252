package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.CouponRequest;
import com.webtechnology.ecommerce.dto.CouponResponse;
import com.webtechnology.ecommerce.dto.CouponCalculationResponse;
import com.webtechnology.ecommerce.dto.ApplyCouponRequest;
import com.webtechnology.ecommerce.service.CouponService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

        private final CouponService couponService;

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
                CouponResponse response = couponService.createCoupon(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.<CouponResponse>builder()
                                                .success(true)
                                                .message("Coupon created successfully")
                                                .data(response)
                                                .build());
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
                return ResponseEntity.ok(ApiResponse.<List<CouponResponse>>builder()
                                .success(true)
                                .message("Coupons retrieved successfully")
                                .data(couponService.getAllCoupons())
                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable UUID id) {
                return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                                .success(true)
                                .message("Coupon retrieved successfully")
                                .data(couponService.getCouponById(id))
                                .build());
        }

        @GetMapping("/by-code/{code}")
        public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
                return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                                .success(true)
                                .message("Coupon retrieved successfully")
                                .data(couponService.getCouponByCode(code))
                                .build());
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
                        @PathVariable UUID id,
                        @Valid @RequestBody CouponRequest request) {
                return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                                .success(true)
                                .message("Coupon updated successfully")
                                .data(couponService.updateCoupon(id, request))
                                .build());
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable UUID id) {
                couponService.deleteCoupon(id);
                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .success(true)
                                .message("Coupon deleted successfully")
                                .data(null)
                                .build());
        }

        @PostMapping("/apply")
        public ResponseEntity<ApiResponse<CouponCalculationResponse>> applyCoupon(
                        @Valid @RequestBody ApplyCouponRequest request) {
                CouponCalculationResponse response = couponService.calculateDiscount(request.getCode(), request.getOrderAmount());
                return ResponseEntity.ok(ApiResponse.<CouponCalculationResponse>builder()
                                .success(response.getIsValid())
                                .message(response.getMessage())
                                .data(response)
                                .build());
        }
}
