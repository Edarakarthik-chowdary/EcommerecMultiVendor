package com.Karthik.repository;

import com.Karthik.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SellerReportRepository
        extends JpaRepository<Order, Long> {

    // Get all orders belonging to a seller
    List<Order> findBySeller_Id(Long sellerId);

    // Count all orders belonging to a seller
    long countBySeller_Id(Long sellerId);

    // Count orders by seller and status
    long countBySeller_IdAndOrderStatusIgnoreCase(
            Long sellerId,
            String orderStatus
    );

    // Calculate total sales for successfully paid orders
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.seller.id = :sellerId
        AND LOWER(o.paymentStatus) = 'success'
        """)
    BigDecimal calculateTotalSales(
            @Param("sellerId") Long sellerId
    );

    // Get seller orders within a date range
    List<Order> findBySeller_IdAndOrderDateBetween(
            Long sellerId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // Count seller orders within a date range
    long countBySeller_IdAndOrderDateBetween(
            Long sellerId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // Calculate sales within a date range
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.seller.id = :sellerId
        AND LOWER(o.paymentStatus) = 'success'
        AND o.orderDate BETWEEN :startDate AND :endDate
        """)
    BigDecimal calculateSalesBetweenDates(
            @Param("sellerId") Long sellerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}