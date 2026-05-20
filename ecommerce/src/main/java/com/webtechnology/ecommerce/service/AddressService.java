package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import java.util.List;
import java.util.UUID;

public interface AddressService {

    AddressResponse createAddress(AddressRequest request);

    List<AddressResponse> getAllAddresses();

    AddressResponse getAddressById(UUID id);

    List<AddressResponse> getAddressesByUserId(UUID userId);

    AddressResponse getDefaultAddressByUserId(UUID userId);

    AddressResponse updateAddress(UUID id, AddressRequest request);

    void deleteAddress(UUID id);

    void deleteAddressesByUserId(UUID userId);
}
