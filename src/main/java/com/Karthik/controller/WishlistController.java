package com.Karthik.controller;
import com.Karthik.model.Wishlist;
import com.Karthik.model.WishlistItem;
import com.Karthik.service.WishlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/user/{userId}/products/{productId}")
    public WishlistItem addToWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        return wishlistService.addToWishlist(userId, productId);
    }

    @GetMapping("/user/{userId}")
    public Wishlist getWishlist(@PathVariable Long userId) {
        return wishlistService.getWishlist(userId);
    }

    @GetMapping("/user/{userId}/items")
    public List<WishlistItem> getWishlistItems(
            @PathVariable Long userId) {

        return wishlistService.getWishlistItems(userId);
    }

    @DeleteMapping("/user/{userId}/products/{productId}")
    public void removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        wishlistService.removeFromWishlist(userId, productId);
    }
}