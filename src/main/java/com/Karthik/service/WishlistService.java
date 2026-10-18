package com.Karthik.service;

import com.Karthik.model.Wishlist;
import com.Karthik.model.WishlistItem;

import java.util.List;

public interface WishlistService {

    WishlistItem addToWishlist(Long userId, Long productId);

    Wishlist getWishlist(Long userId);

    List<WishlistItem> getWishlistItems(Long userId);

    void removeFromWishlist(Long userId, Long productId);
}