package com.Karthik.service;

import com.Karthik.model.Review;

import java.util.List;

public interface ReviewService {

    Review createReview(Long productId, Long userId, Review review);

    Review getReviewById(Long reviewId);

    List<Review> getReviewsByProductId(Long productId);

    Review updateReview(Long reviewId, Review review);

    void deleteReview(Long reviewId);
}