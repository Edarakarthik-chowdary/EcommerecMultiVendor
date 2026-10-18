package com.Karthik.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public Map<String, Object> home() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("application", "Karthik E-commerce API");
        response.put("message", "Welcome to the E-commerce Backend!");
        response.put("version", "1.0.0");
        response.put("status", "Running");
        response.put("description",
                "A Spring Boot REST API for an E-commerce application.");

        Map<String, String> endpoints = new LinkedHashMap<>();

        endpoints.put("users", "/api/users");
        endpoints.put("sellers", "/api/sellers");
        endpoints.put("products", "/api/products");
        endpoints.put("categories", "/api/categories");
        endpoints.put("carts", "/api/carts");
        endpoints.put("orders", "/api/orders");
        endpoints.put("payments", "/api/payments");
        endpoints.put("reviews", "/api/reviews");
        endpoints.put("coupons", "/api/coupons");
        endpoints.put("wishlist", "/api/wishlist");
        endpoints.put("addresses", "/api/addresses");

        response.put("endpoints", endpoints);

        return response;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {

        Map<String, String> response = new LinkedHashMap<>();

        response.put("status", "UP");
        response.put("message", "E-commerce API is running successfully.");

        return response;
    }

    @GetMapping("/api/info")
    public Map<String, String> info() {

        Map<String, String> response = new LinkedHashMap<>();

        response.put("application", "Karthik E-commerce API");
        response.put("framework", "Spring Boot");
        response.put("language", "Java");
        response.put("architecture",
                "Controller-Service-Repository");

        return response;
    }
}