package com.webtechnology.ecommerce.repository;

import com.webtechnology.ecommerce.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByOrderId(UUID orderId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
