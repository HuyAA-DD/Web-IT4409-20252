package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Product;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {
}
