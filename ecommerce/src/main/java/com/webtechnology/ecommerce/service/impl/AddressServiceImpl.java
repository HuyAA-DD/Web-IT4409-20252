package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import com.webtechnology.ecommerce.entity.Address;
import com.webtechnology.ecommerce.entity.Role;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
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
            clearDefaultAddress(request.getUserId());
        }

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAllAddresses() {
        return addressRepository.findAll().stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(UUID id, UUID requesterId) {
        Address address = findAddressById(id);
        checkOwnership(address, requesterId);
        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
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
    public AddressResponse updateAddress(UUID id, AddressRequest request, UUID requesterId) {
        Address existing = findAddressById(id);
        checkOwnership(existing, requesterId);

        addressMapper.updateEntityFromRequest(request, existing);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            clearDefaultAddress(existing.getUser().getId());
            existing.setIsDefault(true);
        }

        return addressMapper.toResponse(addressRepository.save(existing));
    }

    @Override
    public void deleteAddress(UUID id, UUID requesterId) {
        Address address = findAddressById(id);
        checkOwnership(address, requesterId);
        addressRepository.delete(address);
    }

    @Override
    public void deleteAddressesByUserId(UUID userId) {
        addressRepository.deleteByUserId(userId);
    }

    // --- Helpers ---

    private Address findAddressById(UUID id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    /** Cho phép owner hoặc ADMIN truy cập */
    private void checkOwnership(Address address, UUID requesterId) {
        if (address.getUser().getId().equals(requesterId)) return;
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterId));
        if (requester.getRole() == Role.ADMIN) return;
        throw new BadRequestException("You are not authorized to access this address");
    }

    private void clearDefaultAddress(UUID userId) {
        addressRepository.findByUserIdAndIsDefault(userId, true)
                .ifPresent(a -> {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                });
    }
}
