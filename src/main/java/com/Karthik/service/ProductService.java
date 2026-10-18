package com.Karthik.service;

import com.Karthik.model.Product;

import java.util.List;

public interface ProductService {

    Product createProduct(Product product, String sellerEmail);

    Product getProductById(Long id);

    List<Product> getAllProducts();

    List<Product> getProductsBySeller(String sellerEmail);

    Product updateProduct(Long id, Product product, String sellerEmail);

    void deleteProduct(Long id, String sellerEmail);
}