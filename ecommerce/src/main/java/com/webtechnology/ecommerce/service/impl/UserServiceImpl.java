package com.webtechnology.ecommerce.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.ChangePasswordRequest;
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
    public void deleteUser(UUID id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(principal);
        return userMapper.toResponse(findUserById(userId));
    }

    @Override
    public UserResponse updateCurrentUserProfile(UserRequest request) {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(principal);
        return updateUser(userId, request);
    }

    @Override
    public UserResponse updateCurrentUserAvatar(MultipartFile file) {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(principal);
        User user = findUserById(userId);

        // Upload image to Cloudinary
        var fileUploadResponse = fileUploadService.uploadImage(file);

        // Update user avatar URL
        user.setAvatarUrl(fileUploadResponse.getUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(principal);
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

    private void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already in use");
        }
    }
}
