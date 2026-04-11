package com.webtechnology.ecommerce.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class CategoryResponse {
    private UUID id;
    private String name;
    private String description;
    private String parentName; // Trả về tên danh mục cha cho dễ đọc
    private LocalDateTime createdAt;
}