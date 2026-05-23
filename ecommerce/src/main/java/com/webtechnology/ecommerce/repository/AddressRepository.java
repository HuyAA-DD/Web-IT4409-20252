package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Address;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUserId(UUID userId);

    Optional<Address> findByUserIdAndIsDefault(UUID userId, Boolean isDefault);

    void deleteByUserId(UUID userId);
}
