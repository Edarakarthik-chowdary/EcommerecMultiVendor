package com.Karthik.controller;

import com.Karthik.model.Cart;
import com.Karthik.model.CartItem;
import com.Karthik.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Returns the user's cart, creating an empty cart when none exists.
     */
    @GetMapping("/user/{userId}")
    public Cart getCartByUserId(@PathVariable Long userId) {
        return cartService.getOrCreateCart(userId);
    }

    @PostMapping("/user/{userId}/products/{productId}")
    public CartItem addToCart(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int quantity) {

        return cartService.addToCart(userId, productId, quantity);
    }

    @PutMapping("/items/{cartItemId}")
    public CartItem updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {

        return cartService.updateCartItem(cartItemId, quantity);
    }

    @DeleteMapping("/items/{cartItemId}")
    public void removeCartItem(@PathVariable Long cartItemId) {
        cartService.removeCartItem(cartItemId);
    }

    @DeleteMapping("/user/{userId}")
    public void clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
    }
}
