package com.Karthik.service.impl;

import com.Karthik.domain.PaymentStatus;
import com.Karthik.model.Order;
import com.Karthik.model.OrderItem;
import com.Karthik.model.Cart;
import com.Karthik.model.CartItem;
import com.Karthik.model.Product;
import com.Karthik.repository.CartRepository;
import com.Karthik.repository.CartItemRepository;
import com.Karthik.repository.ProductRepository;
import com.Karthik.model.PaymentDetails;
import com.Karthik.repository.OrderRepository;
import com.Karthik.repository.PaymentDetailsRepository;
import com.Karthik.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentDetailsRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentServiceImpl(PaymentDetailsRepository paymentRepository,
                              OrderRepository orderRepository,
                              RazorpayClient razorpayClient,
                              CartRepository cartRepository,
                              CartItemRepository cartItemRepository,
                              ProductRepository productRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Override
    public PaymentDetails createPayment(Long orderId) {
        Order order = findOrder(orderId);
        if ("SUCCESS".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("This order has already been paid");
        }
        if (order.getTotalAmount() == null
                || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order amount must be greater than zero");
        }

        PaymentDetails existing = order.getPaymentDetails();
        if (existing != null && existing.getGatewayOrderId() != null
                && !existing.getGatewayOrderId().isBlank()
                && existing.getPaymentStatus() != PaymentStatus.SUCCESS) {
            return existing;
        }

        try {
            long amountInPaise = order.getTotalAmount().movePointRight(2).longValueExact();
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_" + order.getId());
            com.razorpay.Order gatewayOrder = razorpayClient.orders.create(options);

            PaymentDetails payment = existing == null ? new PaymentDetails() : existing;
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentMethod("RAZORPAY");
            payment.setPaymentGateway("RAZORPAY");
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setGatewayOrderId(gatewayOrder.get("id").toString());
            order.setPaymentDetails(payment);
            order.setPaymentMethod("RAZORPAY");
            order.setPaymentStatus("PENDING");
            orderRepository.save(order);
            return payment;
        } catch (RazorpayException e) {
            throw new IllegalStateException("Unable to create Razorpay order", e);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException(
                    "Order amount must have at most two decimal places", e);
        }
    }

    @Override
    public PaymentDetails verifyPayment(Long orderId, String razorpayOrderId,
                                        String razorpayPaymentId, String signature) {
        Order order = findOrder(orderId);
        PaymentDetails payment = order.getPaymentDetails();
        if (payment == null || payment.getGatewayOrderId() == null
                || !payment.getGatewayOrderId().equals(razorpayOrderId)) {
            throw new IllegalArgumentException("Razorpay order does not match this store order");
        }

        // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret).
        String expectedSignature = hmacSha256(
                razorpayOrderId + "|" + razorpayPaymentId, razorpayKeySecret);
        boolean signatureValid = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));
        if (!signatureValid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentStatus("FAILED");
            paymentRepository.save(payment);
            orderRepository.save(order);
            throw new IllegalArgumentException("Razorpay signature verification failed");
        }

        // Idempotent: do not alter a previously verified success.
        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            // Deduct stock only once, after the payment signature has been verified.
            for (OrderItem item : order.getOrderItems()) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new IllegalStateException("Product not found for order item"));
                if (product.getQuantity() < item.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock to confirm order item: " + product.getTitle());
                }
                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepository.save(product);
            }

            // Clear the customer's backend cart only after verified payment.
            if (order.getUser() != null) {
                cartRepository.findByUser(order.getUser()).ifPresent(cart -> {
                    cartItemRepository.deleteAll(cartItemRepository.findByCart(cart));
                    cart.getCartItems().clear();
                    cart.setTotalSellingPrice(BigDecimal.ZERO);
                    cart.setTotalMrpPrice(BigDecimal.ZERO);
                    cart.setTotalItem(0);
                    cart.setDiscount(BigDecimal.ZERO);
                    cartRepository.save(cart);
                });
            }

            payment.setTransactionId(razorpayPaymentId);
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaymentDate(LocalDateTime.now());
            order.setPaymentStatus("SUCCESS");
            order.setOrderStatus("CONFIRMED");
            orderRepository.save(order);
            paymentRepository.save(payment);
        }
        return payment;
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to verify Razorpay signature", e);
        }
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetails getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetails getPaymentByOrderId(Long orderId) {
        Order order = findOrder(orderId);
        PaymentDetails payment = order.getPaymentDetails();
        if (payment == null) {
            throw new IllegalArgumentException("Payment not found for order: " + orderId);
        }
        return payment;
    }
}