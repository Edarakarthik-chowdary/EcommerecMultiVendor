package com.Karthik.controller;

import com.Karthik.model.Seller;
import com.Karthik.service.SellerAuthService;
import com.Karthik.service.SellerService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/seller")
public class SellerAuthController {

    private final SellerAuthService sellerAuthService;
    private final SellerService sellerService;

    public SellerAuthController(
            SellerAuthService sellerAuthService,
            SellerService sellerService) {
        this.sellerAuthService = sellerAuthService;
        this.sellerService = sellerService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(
            @RequestBody Seller seller) {

        Seller savedSeller = sellerService.createSeller(seller);

        return Map.of(
                "message", "Seller registration successful. Await administrator approval.",
                "id", savedSeller.getId(),
                "sellerName", savedSeller.getSellerName(),
                "email", savedSeller.getEmail(),
                "role", savedSeller.getRole().name(),
                "accountStatus", savedSeller.getAccountStatus().name()
        );
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody Map<String, String> request) {

        return sellerAuthService.login(
                request.get("email"),
                request.get("password")
        );
    }
}