package com.Karthik.controller;

import com.Karthik.model.SellerReport;
import com.Karthik.service.SellerReportService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/sellers/{sellerId}/reports")
public class SellerReportController {

    private final SellerReportService sellerReportService;

    public SellerReportController(
            SellerReportService sellerReportService) {
        this.sellerReportService = sellerReportService;
    }

    // Seller dashboard
    @GetMapping("/dashboard")
    public SellerReport getDashboard(
            @PathVariable Long sellerId) {

        return sellerReportService.getDashboardReport(sellerId);
    }

    // Sales report
    @GetMapping("/sales")
    public SellerReport getSalesReport(
            @PathVariable Long sellerId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return sellerReportService.getSalesReport(
                sellerId, startDate, endDate);
    }

    // Order report
    @GetMapping("/orders")
    public SellerReport getOrderReport(
            @PathVariable Long sellerId) {

        return sellerReportService.getOrderReport(sellerId);
    }
}