package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.CategoryRequest;
import com.webtechnology.ecommerce.dto.CategoryResponse;
import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.repository.CategoryRepository;
import com.webtechnology.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại!");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha!"));
            category.setParentCategory(parent);
        }

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục!"));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        // 1. Tìm category cũ
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cần cập nhật!"));

        // 2. Kiểm tra trùng tên (nếu đổi tên mới)
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục mới đã tồn tại!");
        }

        // 3. Cập nhật thông tin cơ bản
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        // 4. Xử lý danh mục cha
        if (request.getParentId() != null) {
            // Chống trường hợp chọn chính nó làm cha của nó
            if (id.equals(request.getParentId())) {
                throw new BadRequestException("Danh mục không thể là cha của chính nó!");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha!"));
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục để xóa!"));
        
        // Kiểm tra xem có danh mục con nào đang phụ thuộc vào nó không
        // Nếu có, có thể throw lỗi hoặc set parent_id của bọn con về null tùy nghiệp vụ
        List<Category> children = categoryRepository.findByParentCategoryId(id);
        if (!children.isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục đang có danh mục con!");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        
        if (category.getParentCategory() != null) {
            response.setParentName(category.getParentCategory().getName());
        }
        
        return response;
    }
}