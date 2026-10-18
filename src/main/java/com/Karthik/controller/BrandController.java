package com.Karthik.controller;

import com.Karthik.model.Brand;
import com.Karthik.service.BrandService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Brand createBrand(
            @RequestBody Brand brand,
            Authentication authentication) {

        requireAdmin(authentication);
        return brandService.createBrand(brand);
    }

    @PutMapping("/{id}")
    public Brand updateBrand(
            @PathVariable Long id,
            @RequestBody Brand brand,
            Authentication authentication) {

        requireAdmin(authentication);
        return brandService.updateBrand(id, brand);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBrand(
            @PathVariable Long id,
            Authentication authentication) {

        requireAdmin(authentication);
        brandService.deleteBrand(id);
    }

    private void requireAdmin(Authentication authentication) {
        boolean isAdmin = authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new ResponseStatusException(
                    authentication == null
                            ? HttpStatus.UNAUTHORIZED
                            : HttpStatus.FORBIDDEN,
                    "Administrator access required"
            );
        }
    }
}