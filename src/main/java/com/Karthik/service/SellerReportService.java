package com.Karthik.service;

import com.Karthik.model.SellerReport;

import java.time.LocalDate;

public interface SellerReportService {

    SellerReport getDashboardReport(Long sellerId);

    SellerReport getSalesReport(
            Long sellerId,
            LocalDate startDate,
            LocalDate endDate
    );

    SellerReport getOrderReport(Long sellerId);
}