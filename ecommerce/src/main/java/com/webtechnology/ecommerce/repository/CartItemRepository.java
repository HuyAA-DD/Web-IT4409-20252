package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.CartItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCartId(UUID cartId);

    Optional<CartItem> findByCartIdAndProductVariantId(UUID cartId, UUID productVariantId);

    void deleteByCartId(UUID cartId);
}
