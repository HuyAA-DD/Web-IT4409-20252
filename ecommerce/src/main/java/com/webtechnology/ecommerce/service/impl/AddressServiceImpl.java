package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import com.webtechnology.ecommerce.entity.Address;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.AddressMapper;
import com.webtechnology.ecommerce.repository.AddressRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AddressService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Override
    public AddressResponse createAddress(AddressRequest request) {
        Address address = addressMapper.toEntity(request);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        address.setUser(user);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            updateDefaultAddress(request.getUserId());
        }

        Address savedAddress = addressRepository.save(address);
        return addressMapper.toResponse(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAllAddresses() {
        return addressRepository.findAll()
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(UUID id) {
        return addressMapper.toResponse(findAddressById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(UUID userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddressByUserId(UUID userId) {
        Address address = addressRepository.findByUserIdAndIsDefault(userId, true)
                .orElseThrow(() -> new ResourceNotFoundException("Default address not found for user: " + userId));
        return addressMapper.toResponse(address);
    }

    @Override
    public AddressResponse updateAddress(UUID id, AddressRequest request) {
        Address existingAddress = findAddressById(id);
        addressMapper.updateEntityFromRequest(request, existingAddress);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            updateDefaultAddress(existingAddress.getUser().getId());
        }

        Address savedAddress = addressRepository.save(existingAddress);
        return addressMapper.toResponse(savedAddress);
    }

    @Override
    public void deleteAddress(UUID id) {
        Address address = findAddressById(id);
        addressRepository.delete(address);
    }

    @Override
    public void deleteAddressesByUserId(UUID userId) {
        addressRepository.deleteByUserId(userId);
    }

    private Address findAddressById(UUID id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    private void updateDefaultAddress(UUID userId) {
        addressRepository.findByUserIdAndIsDefault(userId, true)
                .ifPresent(address -> {
                    address.setIsDefault(false);
                    addressRepository.save(address);
                });
    }
}
