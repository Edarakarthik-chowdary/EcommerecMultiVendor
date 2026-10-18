package com.Karthik.controller;

import com.Karthik.model.Product;
import com.Karthik.service.ProductService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create a product for the authenticated seller.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(
            @RequestBody Product product,
            Authentication authentication) {

        checkAuthentication(authentication);

        return productService.createProduct(
                product,
                authentication.getName()
        );
    }

    // Public product details.
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Public product listing with debugging.
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        System.out.println("Fetching all products...");

        List<Product> products = productService.getAllProducts();

        System.out.println("Products retrieved: " + products.size());

        return ResponseEntity.ok(products);
    }

    // Products belonging to the authenticated seller.
    @GetMapping("/seller")
    public ResponseEntity<List<Product>> getMyProducts(
            Authentication authentication) {

        checkAuthentication(authentication);

        String sellerEmail = authentication.getName();

        System.out.println("Authenticated seller: " + sellerEmail);

        List<Product> products =
                productService.getProductsBySeller(sellerEmail);

        System.out.println("Seller products retrieved: " + products.size());

        return ResponseEntity.ok(products);
    }

    // Update a seller's own product.
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            Authentication authentication) {

        checkAuthentication(authentication);

        return productService.updateProduct(
                id,
                product,
                authentication.getName()
        );
    }

    // Delete a seller's own product.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        checkAuthentication(authentication);

        productService.deleteProduct(
                id,
                authentication.getName()
        );
    }

    private void checkAuthentication(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in as a seller."
            );
        }
    }
}