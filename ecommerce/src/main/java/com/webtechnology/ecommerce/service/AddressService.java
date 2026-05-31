package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import java.util.List;
import java.util.UUID;

public interface AddressService {

    AddressResponse createAddress(AddressRequest request);

    List<AddressResponse> getAllAddresses();

    /** Lấy địa chỉ theo id — kiểm tra ownership (owner hoặc ADMIN) */
    AddressResponse getAddressById(UUID id, UUID requesterId);

    List<AddressResponse> getAddressesByUserId(UUID userId);

    AddressResponse getDefaultAddressByUserId(UUID userId);

    /** Cập nhật địa chỉ — kiểm tra ownership */
    AddressResponse updateAddress(UUID id, AddressRequest request, UUID requesterId);

    /** Xóa địa chỉ — kiểm tra ownership */
    void deleteAddress(UUID id, UUID requesterId);

    void deleteAddressesByUserId(UUID userId);
}
