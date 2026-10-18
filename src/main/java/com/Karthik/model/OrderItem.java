package com.Karthik.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Product included in this order item
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Quantity ordered
    @Column(nullable = false)
    private Integer quantity;

    // MRP of one unit when the order was placed
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal mrpPrice;

    // Selling price of one unit when the order was placed
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    // Total price for this order item
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}