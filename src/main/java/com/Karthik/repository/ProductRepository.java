package com.Karthik.repository;

import com.Karthik.model.Brand;
import com.Karthik.model.Product;
import com.Karthik.model.Seller;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(
            value = "SELECT * FROM products WHERE seller_id = :sellerId",
            nativeQuery = true
    )
    List<Product> findBySellerId(@Param("sellerId") Long sellerId);

    List<Product> findBySeller(Seller seller);

    // Check whether any products use this brand.
     boolean existsByBrandId(Long brandId);

    // Filter products by brand.
    List<Product> findByBrandId(Long brandId);

    // Filter products by category.
    List<Product> findByCategoryId(Long categoryId);

    // Filter by both brand and category.
    List<Product> findByBrandIdAndCategoryId(
            Long brandId,
            Long categoryId
    );

    List<Product> findByBrand(Brand brand);
}