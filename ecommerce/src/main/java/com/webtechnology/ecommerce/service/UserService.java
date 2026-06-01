
package com.webtechnology.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.UserRequest;
import com.webtechnology.ecommerce.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(UUID id);

    UserResponse updateUser(UUID id, UserRequest request);

    void deleteUser(UUID id);

    UserResponse getCurrentUser();

    UserResponse updateCurrentUserProfile(UserRequest request);

    UserResponse updateCurrentUserAvatar(MultipartFile file);
}
