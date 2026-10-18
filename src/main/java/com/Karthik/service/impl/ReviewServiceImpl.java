package com.Karthik.service.impl;

import com.Karthik.model.Product;
import com.Karthik.model.Review;
import com.Karthik.model.User;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.ReviewRepository;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Review createReview(Long productId, Long userId, Review review) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));

        review.setProduct(product);
        review.setUser(user);

        return reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Review getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new RuntimeException("Review not found: " + reviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public Review updateReview(Long reviewId, Review review) {
        Review existing = getReviewById(reviewId);

        // Add updates for your actual review fields here.
        // Example, if present: existing.setComment(review.getComment());
        // Example, if present: existing.setRating(review.getRating());

        return reviewRepository.save(existing);
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review existing = getReviewById(reviewId);
        reviewRepository.delete(existing);
    }
}