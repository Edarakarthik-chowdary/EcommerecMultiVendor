package com.Karthik.service.impl;

import com.Karthik.model.SellerReport;
import com.Karthik.repository.SellerReportRepository;
import com.Karthik.repository.SellerRepository;
import com.Karthik.service.SellerReportService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional(readOnly = true)
public class SellerReportServiceImpl implements SellerReportService {

    private final SellerReportRepository reportRepository;
    private final SellerRepository sellerRepository;

    public SellerReportServiceImpl(
            SellerReportRepository reportRepository,
            SellerRepository sellerRepository) {

        this.reportRepository = reportRepository;
        this.sellerRepository = sellerRepository;
    }

    // Validate seller
    private void validateSeller(Long sellerId) {

        if (sellerId == null || sellerId <= 0) {
            throw new IllegalArgumentException(
                    "A valid seller ID is required."
            );
        }

        sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Seller not found with ID: " + sellerId
                        ));
    }

    // Dashboard report
    @Override
    public SellerReport getDashboardReport(Long sellerId) {

        validateSeller(sellerId);

        return new SellerReport(
                sellerId,
                reportRepository.countBySeller_Id(sellerId),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "PENDING"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "CONFIRMED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "SHIPPED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "DELIVERED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "CANCELLED"),
                safeAmount(
                        reportRepository.calculateTotalSales(sellerId))
        );
    }

    // Sales report for a date range
    @Override
    public SellerReport getSalesReport(
            Long sellerId,
            LocalDate startDate,
            LocalDate endDate) {

        validateSeller(sellerId);

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required."
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date must not be after end date."
            );
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();

        LocalDateTime endDateTime =
                endDate.plusDays(1).atStartOfDay().minusNanos(1);

        long totalOrders =
                reportRepository.countBySeller_IdAndOrderDateBetween(
                        sellerId, startDateTime, endDateTime);

        BigDecimal totalSales =
                reportRepository.calculateSalesBetweenDates(
                        sellerId, startDateTime, endDateTime);

        return new SellerReport(
                sellerId,
                totalOrders,
                0,
                0,
                0,
                0,
                0,
                safeAmount(totalSales)
        );
    }

    // Order status report
    @Override
    public SellerReport getOrderReport(Long sellerId) {

        validateSeller(sellerId);

        return new SellerReport(
                sellerId,
                reportRepository.countBySeller_Id(sellerId),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "PENDING"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "CONFIRMED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "SHIPPED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "DELIVERED"),
                reportRepository.countBySeller_IdAndOrderStatusIgnoreCase(
                        sellerId, "CANCELLED"),
                safeAmount(
                        reportRepository.calculateTotalSales(sellerId))
        );
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }
}