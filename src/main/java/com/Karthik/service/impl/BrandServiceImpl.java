package com.Karthik.service.impl;

import com.Karthik.model.Brand;
import com.Karthik.model.Category;
import com.Karthik.repository.BrandRepository;
import com.Karthik.repository.CategoryRepository;
import com.Karthik.repository.ProductRepository;
import com.Karthik.service.BrandService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public BrandServiceImpl(
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository) {

        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Brand createBrand(Brand brand) {
        validateBrand(brand);

        String name = brand.getName().trim();

        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A brand with this name already exists"
            );
        }

        brand.setId(null);
        brand.setName(name);
        brand.setCategories(resolveCategories(brand.getCategories()));

        return brandRepository.save(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Brand not found"
                ));
    }

    @Override
    public Brand updateBrand(Long id, Brand updatedBrand) {
        validateBrand(updatedBrand);

        Brand existingBrand = getBrandById(id);
        String name = updatedBrand.getName().trim();

        brandRepository.findByNameIgnoreCase(name).ifPresent(found -> {
            if (!found.getId().equals(id)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "A brand with this name already exists"
                );
            }
        });

        existingBrand.setName(name);
        existingBrand.setDescription(updatedBrand.getDescription());
        existingBrand.setLogoUrl(updatedBrand.getLogoUrl());
        existingBrand.setCategories(
                resolveCategories(updatedBrand.getCategories())
        );

        return brandRepository.save(existingBrand);
    }

    @Override
    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);

        // Prevent deleting a brand that is assigned to products.
        if (productRepository.existsByBrandId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete this brand because products are associated with it."
            );
        }

        brandRepository.delete(brand);
    }

    private void validateBrand(Brand brand) {
        if (brand == null
                || brand.getName() == null
                || brand.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Brand name is required"
            );
        }

        if (brand.getName().trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Brand name cannot exceed 100 characters"
            );
        }
    }

    private Set<Category> resolveCategories(
            Set<Category> requestedCategories) {

        Set<Category> resolved = new HashSet<>();

        if (requestedCategories == null) {
            return resolved;
        }

        for (Category requested : requestedCategories) {
            if (requested == null || requested.getId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Every category must have an ID"
                );
            }

            Long categoryId = requested.getId();

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Category not found: " + categoryId
                    ));

            resolved.add(category);
        }

        return resolved;
    }
}