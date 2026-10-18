package com.Karthik.repository;

import com.Karthik.model.Product;
import com.Karthik.model.Wishlist;
import com.Karthik.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository
        extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByWishlist(Wishlist wishlist);

    Optional<WishlistItem> findByWishlistAndProduct(
            Wishlist wishlist,
            Product product
    );
}