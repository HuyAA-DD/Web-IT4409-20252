package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.CategoryRequest;
import com.webtechnology.ecommerce.dto.CategoryResponse;
import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse updateCategory(UUID id, CategoryRequest request);
    void deleteCategory(UUID id);
}