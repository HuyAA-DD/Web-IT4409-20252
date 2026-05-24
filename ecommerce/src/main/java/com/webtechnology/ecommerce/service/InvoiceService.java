package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.entity.Invoice;
import java.util.UUID;

public interface InvoiceService {
    Invoice getInvoiceByOrderId(UUID orderId);
    Invoice createInvoiceForOrder(UUID orderId);
}
