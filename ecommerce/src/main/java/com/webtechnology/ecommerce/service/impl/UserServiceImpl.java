
package com.webtechnology.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.ChangePasswordRequest;
import com.webtechnology.ecommerce.dto.UpdateUserRoleRequest;
import com.webtechnology.ecommerce.dto.UpdateUserStatusRequest;
import com.webtechnology.ecommerce.dto.UserCreateRequest;
import com.webtechnology.ecommerce.dto.UserRequest;
import com.webtechnology.ecommerce.dto.UserResponse;
import com.webtechnology.ecommerce.entity.Role;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.UserMapper;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.FileUploadService;
import com.webtechnology.ecommerce.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        validateEmailUniqueness(request.getEmail());

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return userMapper.toResponse(findUserById(id));
    }

    @Override
    public UserResponse updateUser(UUID id, UserRequest request) {
        User existingUser = findUserById(id);

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BadRequestException("Email is already in use");
        }

        userMapper.updateEntityFromRequest(request, existingUser);
        
        return userMapper.toResponse(userRepository.save(existingUser));
    }

    @Override
    public UserResponse updateUserRole(UUID id, UpdateUserRoleRequest request) {
        User user = findUserById(id);
        user.setRole(request.getRole());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request) {
        return setUserActiveStatus(id, request.getActive());
    }

    @Override
    public UserResponse lockUser(UUID id) {
        return setUserActiveStatus(id, false);
    }

    @Override
    public UserResponse unlockUser(UUID id) {
        return setUserActiveStatus(id, true);
    }

    private UserResponse setUserActiveStatus(UUID id, Boolean active) {
        UUID currentUserId = getCurrentUserId();
        if (currentUserId.equals(id) && Boolean.FALSE.equals(active)) {
            throw new BadRequestException("Admin cannot lock their own account");
        }

        User user = findUserById(id);
        user.setActive(active);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(UUID id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(findUserById(getCurrentUserId()));
    }

    @Override
    public UserResponse updateCurrentUserProfile(UserRequest request) {
        return updateUser(getCurrentUserId(), request);
    }

    @Override
    public UserResponse updateCurrentUserAvatar(MultipartFile file) {
        UUID userId = getCurrentUserId();
        User user = findUserById(userId);

        // Upload image to Cloudinary
        var fileUploadResponse = fileUploadService.uploadImage(file);

        // Update user avatar URL
        user.setAvatarUrl(fileUploadResponse.getUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        UUID userId = getCurrentUserId();
        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UUID getCurrentUserId() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(principal);
    }

    private void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already in use");
        }
    }
}
