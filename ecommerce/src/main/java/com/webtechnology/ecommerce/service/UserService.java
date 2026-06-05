
package com.webtechnology.ecommerce.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.ChangePasswordRequest;
import com.webtechnology.ecommerce.dto.UpdateUserRoleRequest;
import com.webtechnology.ecommerce.dto.UpdateUserStatusRequest;
import com.webtechnology.ecommerce.dto.UserCreateRequest;
import com.webtechnology.ecommerce.dto.UserRequest;
import com.webtechnology.ecommerce.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(UUID id);

    UserResponse updateUser(UUID id, UserRequest request);

    UserResponse updateUserRole(UUID id, UpdateUserRoleRequest request);

    UserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request);

    UserResponse lockUser(UUID id);

    UserResponse unlockUser(UUID id);

    void deleteUser(UUID id);

    UserResponse getCurrentUser();

    UserResponse updateCurrentUserProfile(UserRequest request);

    UserResponse updateCurrentUserAvatar(MultipartFile file);

    void changePassword(ChangePasswordRequest request);
}
