package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.entity.Invoice;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.repository.InvoiceRepository;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoiceByOrderId(UUID orderId) {
        return invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order id: " + orderId));
    }

    @Override
    public Invoice createInvoiceForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        return invoiceRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Invoice invoice = Invoice.builder()
                            .order(order)
                            .user(order.getUser())
                            .invoiceNumber("INV-" + System.currentTimeMillis())
                            .totalAmount(order.getSubTotal() != null ? order.getSubTotal() : order.getTotalAmount())
                            .discountAmount(order.getDiscountAmount())
                            .finalAmount(order.getTotalAmount())
                            .status("ISSUED")
                            .issuedAt(LocalDateTime.now())
                            .build();
                    return invoiceRepository.save(invoice);
                });
    }
}
