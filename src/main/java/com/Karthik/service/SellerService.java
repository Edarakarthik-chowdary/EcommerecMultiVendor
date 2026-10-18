package com.Karthik.service;

import com.Karthik.model.Seller;

import java.util.List;

public interface SellerService {

    Seller createSeller(Seller seller);

    Seller getSellerById(Long id);

    List<Seller> getAllSellers();

    Seller updateSeller(Long id, Seller seller);

    void deleteSeller(Long id);
}