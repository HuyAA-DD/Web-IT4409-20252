package com.webtechnology.ecommerce.controller;

import com.webtechnology.ecommerce.dto.ApiResponse;
import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import com.webtechnology.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AddressController {

    private final AddressService addressService;

    /** Tạo địa chỉ — userId lấy từ JWT, không cần truyền trong body */
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        request.setUserId(userId);
        AddressResponse response = addressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AddressResponse>builder()
                        .success(true)
                        .message("Address created successfully")
                        .data(response)
                        .build());
    }

    /** Lấy tất cả địa chỉ — chỉ ADMIN */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAllAddresses() {
        return ResponseEntity.ok(ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses retrieved successfully")
                .data(addressService.getAllAddresses())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        AddressResponse response = addressService.getAddressById(id, userId);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address retrieved successfully")
                .data(response)
                .build());
    }

    /** Lấy địa chỉ của chính mình */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses retrieved successfully")
                .data(addressService.getAddressesByUserId(userId))
                .build());
    }

    /** Lấy địa chỉ của user bất kỳ — chỉ ADMIN */
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddressesByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses retrieved successfully")
                .data(addressService.getAddressesByUserId(userId))
                .build());
    }

    @GetMapping("/my/default")
    public ResponseEntity<ApiResponse<AddressResponse>> getMyDefaultAddress(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Default address retrieved successfully")
                .data(addressService.getDefaultAddressByUserId(userId))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        AddressResponse response = addressService.updateAddress(id, request, userId);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address updated successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        addressService.deleteAddress(id, userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Address deleted successfully")
                .data(null)
                .build());
    }

    /** Xóa tất cả địa chỉ của chính mình */
    @DeleteMapping("/my")
    public ResponseEntity<ApiResponse<Void>> deleteMyAddresses(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        addressService.deleteAddressesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Addresses deleted successfully")
                .data(null)
                .build());
    }
}
