package com.Karthik.service.impl;

import com.Karthik.model.Cart;
import com.Karthik.model.CartItem;
import com.Karthik.model.Product;
import com.Karthik.model.User;
import com.Karthik.repository.CartItemRepository;
import com.Karthik.repository.CartRepository;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Cart getCartByUserId(Long userId) {
        User user = findUser(userId);

        return cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found for user: " + userId));
    }

    /**
     * Returns the existing cart, or creates an empty cart for this user.
     * Use this for cart-page initialization; checkout still requires cart items
     * to be saved to the backend before an order is created.
     */
    @Override
    public Cart getOrCreateCart(Long userId) {
        User user = findUser(userId);

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setCartItems(new HashSet<>());
                    cart.setTotalSellingPrice(BigDecimal.ZERO);
                    cart.setTotalMrpPrice(BigDecimal.ZERO);
                    cart.setDiscount(BigDecimal.ZERO);
                    cart.setTotalItem(0);
                    return cartRepository.save(cart);
                });
    }

    @Override
    public CartItem addToCart(Long userId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        User user = findUser(userId);
        Product product = findProduct(productId);

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setCartItems(new HashSet<>());
                    newCart.setTotalSellingPrice(BigDecimal.ZERO);
                    newCart.setTotalMrpPrice(BigDecimal.ZERO);
                    newCart.setDiscount(BigDecimal.ZERO);
                    newCart.setTotalItem(0);
                    return cartRepository.save(newCart);
                });

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    newItem.setMrpPrice(product.getMrpPrice());
                    newItem.setSellingPrice(product.getSellingPrice());
                    return newItem;
                });

        int newQuantity = item.getQuantity() + quantity;
        if (newQuantity > product.getQuantity()) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        item.setQuantity(newQuantity);
        CartItem savedItem = cartItemRepository.save(item);
        cart.getCartItems().add(savedItem);
        recalculateCart(cart);

        return savedItem;
    }

    @Override
    public CartItem updateCartItem(Long cartItemId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found: " + cartItemId));

        if (quantity > item.getProduct().getQuantity()) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        item.setQuantity(quantity);
        CartItem savedItem = cartItemRepository.save(item);
        recalculateCart(item.getCart());

        return savedItem;
    }

    @Override
    public void removeCartItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found: " + cartItemId));

        Cart cart = item.getCart();
        cart.getCartItems().remove(item);
        cartItemRepository.delete(item);
        recalculateCart(cart);
    }

    @Override
    public void clearCart(Long userId) {
        User user = findUser(userId);
        Cart cart = cartRepository.findByUser(user)
                .orElse(null);

        // An absent cart is already empty; do not throw during cleanup.
        if (cart == null) {
            return;
        }

        List<CartItem> items = cartItemRepository.findByCart(cart);
        cartItemRepository.deleteAll(items);
        cart.getCartItems().clear();
        recalculateCart(cart);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    private void recalculateCart(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart(cart);

        BigDecimal totalSellingPrice = BigDecimal.ZERO;
        BigDecimal totalMrpPrice = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : items) {
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());

            totalSellingPrice = totalSellingPrice.add(
                    item.getSellingPrice().multiply(quantity));
            totalMrpPrice = totalMrpPrice.add(
                    item.getMrpPrice().multiply(quantity));
            totalItems += item.getQuantity();
        }

        cart.setTotalSellingPrice(totalSellingPrice);
        cart.setTotalMrpPrice(totalMrpPrice);
        cart.setTotalItem(totalItems);
        cart.setDiscount(totalMrpPrice.subtract(totalSellingPrice));
        cartRepository.save(cart);
    }
}
