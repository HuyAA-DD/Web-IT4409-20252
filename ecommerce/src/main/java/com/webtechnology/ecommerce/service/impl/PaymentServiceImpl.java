package com.webtechnology.ecommerce.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtechnology.ecommerce.dto.PaymentResponse;
import com.webtechnology.ecommerce.dto.SepayCheckoutRequest;
import com.webtechnology.ecommerce.dto.SepayPaymentResponse;
import com.webtechnology.ecommerce.dto.SepayTransactionStatusResponse;
import com.webtechnology.ecommerce.entity.Order;
import com.webtechnology.ecommerce.entity.Payment;
import com.webtechnology.ecommerce.enums.OrderStatus;
import com.webtechnology.ecommerce.enums.PaymentMethod;
import com.webtechnology.ecommerce.enums.PaymentStatus;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.repository.OrderRepository;
import com.webtechnology.ecommerce.repository.PaymentRepository;
import com.webtechnology.ecommerce.service.PaymentService;
import com.webtechnology.ecommerce.service.SepayService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SepayService sepayService;

    @Override
    public PaymentResponse createSepayCheckout(UUID userId, SepayCheckoutRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to pay for this order");
        }

        if (!PaymentMethod.SEPAY.equals(order.getPaymentMethod())) {
            throw new BadRequestException("Order payment method is not SEPAY");
        }

        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            throw new BadRequestException("Payment has already been completed for this order");
        }

        SepayPaymentResponse sepayResponse = sepayService.initiatePayment(
                order.getId().toString(),
                order.getTotalAmount(),
                null,
                request.getReturnUrl(),
                "Payment for order " + order.getId()
        );

        Payment payment = Payment.builder()
                .order(order)
                .method(order.getPaymentMethod())
                .transactionId(sepayResponse.getTransactionId())
                .amount(order.getTotalAmount())
                .status(sepayResponse.getStatus())
                .build();
        paymentRepository.save(payment);

        if (PaymentStatus.PAID.equals(sepayResponse.getStatus())) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return PaymentResponse.builder()
                .orderId(order.getId())
                .transactionId(sepayResponse.getTransactionId())
                .amount(sepayResponse.getAmount())
                .paymentStatus(sepayResponse.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentUrl(sepayResponse.getPaymentUrl())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view payment status for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        return PaymentResponse.builder()
                .orderId(orderId)
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getStatus())
                .paymentMethod(payment.getMethod())
                .paymentUrl(null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SepayTransactionStatusResponse queryTransactionStatus(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to query payment status for this order");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        return sepayService.getTransactionStatus(payment.getTransactionId(), orderId.toString());
    }
}
