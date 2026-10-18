package com.Karthik.service.impl;

import com.Karthik.model.Seller;
import com.Karthik.repository.SellerRepository;
import com.Karthik.service.SellerService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    public SellerServiceImpl(
            SellerRepository sellerRepository,
            PasswordEncoder passwordEncoder) {
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Seller createSeller(Seller seller) {
        if (seller.getEmail() == null || seller.getEmail().isBlank()) {
            throw new IllegalArgumentException("Seller email is required");
        }

        if (seller.getPassword() == null
                || seller.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters"
            );
        }

        String email = seller.getEmail().trim().toLowerCase();

        if (sellerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Seller email is already registered"
            );
        }

        seller.setEmail(email);
        seller.setPassword(passwordEncoder.encode(seller.getPassword()));

        // Never accept a privileged role or approval status from the request.
        seller.setRole(com.Karthik.domain.USER_ROLE.ROLE_SELLER);
        seller.setAccountStatus(
                com.Karthik.domain.AccountStatus.PENDING_VERIFICATION
        );
        seller.setEmailVerified(false);

        return sellerRepository.save(seller);
    }

    @Override
    @Transactional(readOnly = true)
    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seller> getAllSellers() {
        return sellerRepository.findAll();
    }

    @Override
    public Seller updateSeller(Long id, Seller seller) {
        Seller existing = getSellerById(id);

        existing.setSellerName(seller.getSellerName());
        existing.setMobile(seller.getMobile());

        return sellerRepository.save(existing);
    }

    @Override
    public void deleteSeller(Long id) {
        Seller existing = getSellerById(id);
        sellerRepository.delete(existing);
    }
}