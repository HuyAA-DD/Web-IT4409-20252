package com.webtechnology.ecommerce.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtechnology.ecommerce.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderId(UUID orderId);

    /** Dùng để kiểm tra idempotency — tránh xử lý cùng 1 giao dịch SePay 2 lần */
    boolean existsByTransactionId(String transactionId);
}
