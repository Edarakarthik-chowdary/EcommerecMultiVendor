package com.Karthik.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cart to which this item belongs
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // Product added to the cart
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Selected product size
    private String size;

    // Number of units
    @Column(nullable = false)
    private int quantity = 1;

    // MRP per unit
    @Column(precision = 12, scale = 2)
    private BigDecimal mrpPrice;

    // Selling price per unit
    @Column(precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    // User associated with this cart item
    private Long userId;
}