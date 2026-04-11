package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    // Kiểm tra xem tên danh mục đã tồn tại chưa (để tránh tạo trùng)
    boolean existsByName(String name);

    // Lấy tất cả các danh mục gốc (Những cái không có cha)
    List<Category> findByParentCategoryIsNull();

    // Lấy tất cả danh mục con của một danh mục cha cụ thể
    List<Category> findByParentCategoryId(UUID parentId);
}