package com.Karthik.service;

import com.Karthik.model.Cart;
import com.Karthik.model.CartItem;

public interface CartService {

    Cart getCartByUserId(Long userId);

    /**
     * Returns the user's cart, creating an empty cart if one does not exist.
     */
    Cart getOrCreateCart(Long userId);

    CartItem addToCart(Long userId, Long productId, int quantity);

    CartItem updateCartItem(Long cartItemId, int quantity);

    void removeCartItem(Long cartItemId);

    void clearCart(Long userId);
}
