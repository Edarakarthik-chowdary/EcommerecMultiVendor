package com.Karthik.service;

import com.Karthik.model.Address;

import java.util.List;

public interface AddressService {

    // Create an address for a user
    Address createAddress(Long userId, Address address);

    // Get address by ID
    Address getAddressById(Long addressId);

    // Get all addresses belonging to a user
    List<Address> getAddressesByUserId(Long userId);

    // Update an existing address
    Address updateAddress(Long addressId, Address address);

    // Delete address by ID
    void deleteAddress(Long addressId);
}