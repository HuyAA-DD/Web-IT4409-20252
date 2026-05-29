package com.webtechnology.ecommerce.dto;

import com.webtechnology.ecommerce.entity.Role;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String fullName;
    private Role role;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String avatarUrl;
}
