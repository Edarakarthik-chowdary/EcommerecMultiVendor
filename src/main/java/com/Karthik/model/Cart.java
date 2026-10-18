package com.Karthik.model;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One cart belongs to one user
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Products added to the cart
    @OneToMany(
            mappedBy = "cart",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<CartItem> cartItems = new HashSet<>();

    // Total selling price of all cart items
    @Column(precision = 12, scale = 2)
    private BigDecimal totalSellingPrice = BigDecimal.ZERO;

    // Total quantity of products in the cart
    private int totalItem;

    // Total MRP of all cart items
    @Column(precision = 12, scale = 2)
    private BigDecimal totalMrpPrice = BigDecimal.ZERO;

    // Total discount amount
    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    // Applied coupon code
    private String couponCode;
}