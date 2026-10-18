package com.Karthik.repository;
import com.Karthik.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Find all reviews for a specific product
    List<Review> findByProductId(Long productId);
}