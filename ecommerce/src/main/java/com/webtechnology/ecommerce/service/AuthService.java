package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.AuthLoginRequest;
import com.webtechnology.ecommerce.dto.AuthRegisterRequest;
import com.webtechnology.ecommerce.dto.AuthResponse;
import com.webtechnology.ecommerce.dto.UserResponse;

public interface AuthService {

    AuthResponse register(AuthRegisterRequest request);

    AuthResponse login(AuthLoginRequest request);

    UserResponse getCurrentUser(java.util.UUID userId);
}
