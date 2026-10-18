package com.Karthik.controller;

import com.Karthik.model.Review;
import com.Karthik.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/product/{productId}/user/{userId}")
    public Review createReview(
            @PathVariable Long productId,
            @PathVariable Long userId,
            @RequestBody Review review) {

        return reviewService.createReview(productId, userId, review);
    }

    @GetMapping("/{reviewId}")
    public Review getReviewById(@PathVariable Long reviewId) {
        return reviewService.getReviewById(reviewId);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getReviewsByProductId(
            @PathVariable Long productId) {
        return reviewService.getReviewsByProductId(productId);
    }

    @PutMapping("/{reviewId}")
    public Review updateReview(
            @PathVariable Long reviewId,
            @RequestBody Review review) {

        return reviewService.updateReview(reviewId, review);
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
    }
}