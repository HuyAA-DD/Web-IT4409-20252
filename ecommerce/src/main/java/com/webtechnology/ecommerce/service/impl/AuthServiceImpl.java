package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.AuthLoginRequest;
import com.webtechnology.ecommerce.dto.AuthRegisterRequest;
import com.webtechnology.ecommerce.dto.AuthResponse;
import com.webtechnology.ecommerce.dto.UserResponse;
import com.webtechnology.ecommerce.entity.Role;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.UserMapper;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.AuthService;
import com.webtechnology.ecommerce.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(AuthRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userMapper.toResponse(savedUser))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }
}
