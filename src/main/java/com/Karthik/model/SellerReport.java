package com.Karthik.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerReport {

    private Long sellerId;

    private long totalOrders;

    private long pendingOrders;

    private long confirmedOrders;

    private long shippedOrders;

    private long deliveredOrders;

    private long cancelledOrders;

    private BigDecimal totalSales;
}