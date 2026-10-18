package com.Karthik.service;

import com.Karthik.domain.AccountStatus;
import com.Karthik.model.Seller;
import com.Karthik.repository.SellerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class SellerAuthService {

    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public SellerAuthService(
            SellerRepository sellerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(String email, String password) {

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required"
            );
        }

        Seller seller = sellerRepository.findByEmail(
                        email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(password, seller.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        if (seller.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your seller account is not active. Please contact the administrator."
            );
        }

        String token = jwtService.generateToken(
                seller.getEmail(),
                seller.getRole().name()
        );

        return Map.of(
                "message", "Seller login successful",
                "id", seller.getId(),
                "sellerName", seller.getSellerName(),
                "email", seller.getEmail(),
                "role", seller.getRole().name(),
                "token", token
        );
    }
}