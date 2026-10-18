package com.Karthik.controller;

import com.Karthik.model.Order;
import com.Karthik.model.PaymentDetails;
import com.Karthik.model.User;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.OrderService;
import com.Karthik.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.id}")
    private String razorpayKeyId;

    public PaymentController(
            PaymentService paymentService,
            OrderService orderService,
            UserRepository userRepository) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping("/key-id")
    public Map<String, String> getPublicKeyId() {
        // Razorpay Key ID is public; never return the Key Secret.
        return Map.of("keyId", razorpayKeyId);
    }

    @PostMapping("/order/{orderId}")
    public PaymentDetails createPayment(
            @PathVariable Long orderId,
            Authentication authentication) {
        requireOrderOwnership(orderId, authentication);
        return paymentService.createPayment(orderId);
    }

    public record VerifyPaymentRequest(
            String razorpay_order_id,
            String razorpay_payment_id,
            String razorpay_signature) {}

    @PostMapping("/order/{orderId}/verify")
    public PaymentDetails verifyPayment(
            @PathVariable Long orderId,
            @RequestBody VerifyPaymentRequest request,
            Authentication authentication) {
        requireOrderOwnership(orderId, authentication);

        if (request == null
                || blank(request.razorpay_order_id())
                || blank(request.razorpay_payment_id())
                || blank(request.razorpay_signature())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Missing Razorpay verification fields");
        }

        return paymentService.verifyPayment(
                orderId,
                request.razorpay_order_id(),
                request.razorpay_payment_id(),
                request.razorpay_signature());
    }

    @GetMapping("/{paymentId}")
    public PaymentDetails getPaymentById(
            @PathVariable Long paymentId,
            Authentication authentication) {
        requireAdmin(authentication);
        return paymentService.getPaymentById(paymentId);
    }

    @GetMapping("/order/{orderId}")
    public PaymentDetails getPaymentByOrderId(
            @PathVariable Long orderId,
            Authentication authentication) {
        requireOrderOwnership(orderId, authentication);
        return paymentService.getPaymentByOrderId(orderId);
    }

    private void requireOrderOwnership(Long orderId, Authentication authentication) {
        User customer = authenticatedUser(authentication);
        Order order = orderService.getOrderById(orderId);
        if (order.getUser() == null || order.getUser().getId() == null
                || !order.getUser().getId().equals(customer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can access payments only for your own orders");
        }
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Administrator access required");
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}