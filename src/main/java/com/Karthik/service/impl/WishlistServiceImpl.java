package com.Karthik.service.impl;

import com.Karthik.model.Product;
import com.Karthik.model.User;
import com.Karthik.model.Wishlist;
import com.Karthik.model.WishlistItem;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.UserRepository;
import com.Karthik.repository.WishlistItemRepository;
import com.Karthik.repository.WishlistRepository;
import com.Karthik.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            WishlistItemRepository wishlistItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public WishlistItem addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + productId));

        Wishlist wishlist = wishlistRepository.findByUser(user)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUser(user);
                    newWishlist.setWishlistItems(new HashSet<>());
                    return wishlistRepository.save(newWishlist);
                });

        return wishlistItemRepository
                .findByWishlistAndProduct(wishlist, product)
                .orElseGet(() -> {
                    WishlistItem item = new WishlistItem();
                    item.setWishlist(wishlist);
                    item.setProduct(product);

                    WishlistItem saved = wishlistItemRepository.save(item);
                    wishlist.getWishlistItems().add(saved);

                    return saved;
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Wishlist getWishlist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));

        return wishlistRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Wishlist not found for user: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItem> getWishlistItems(Long userId) {
        Wishlist wishlist = getWishlist(userId);
        return wishlistItemRepository.findByWishlist(wishlist);
    }

    @Override
    public void removeFromWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));

        Wishlist wishlist = getWishlist(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + productId));

        WishlistItem item = wishlistItemRepository
                .findByWishlistAndProduct(wishlist, product)
                .orElseThrow(() ->
                        new RuntimeException("Product not found in wishlist"));

        wishlist.getWishlistItems().remove(item);
        wishlistItemRepository.delete(item);
    }
}