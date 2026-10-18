package com.Karthik.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique order number visible to customers
    @Column(unique = true)
    private String orderNumber;

    // Customer who placed the order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Seller associated with the order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private Seller seller;

    // Products included in the order
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<OrderItem> orderItems = new ArrayList<>();

    // Shipping address
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    // Payment information
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_details_id", unique = true)
    private PaymentDetails paymentDetails;

    // Pricing information
    @Column(precision = 12, scale = 2)
    private BigDecimal totalMrpPrice = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalSellingPrice = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal shippingCharge = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // Order and payment statuses
    @Column(length = 30)
    private String orderStatus = "PENDING";

    @Column(length = 30)
    private String paymentStatus = "PENDING";

    @Column(length = 50)
    private String paymentMethod;

    // Delivery and tracking information
    private String trackingNumber;

    private String courierName;

    private String shippingMethod;

    // Customer instructions
    @Column(length = 1000)
    private String orderNotes;

    // Order lifecycle timestamps
    private LocalDateTime orderDate;

    private LocalDateTime confirmedAt;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime cancelledAt;

    private LocalDateTime expectedDeliveryDate;

    // Cancellation information
    @Column(length = 500)
    private String cancellationReason;

    // Automatically set when the order is created
    @PrePersist
    protected void onCreate() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }
}