package com.Karthik.service.impl;

import com.Karthik.model.Address;
import com.Karthik.model.User;
import com.Karthik.repository.AddressRepository;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.AddressService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // Create address for a user
    @Override
    public Address createAddress(Long userId, Address address) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + userId));

        address.setId(null);
        address.setUser(user);

        return addressRepository.save(address);
    }

    // Get address by ID
    @Override
    @Transactional(readOnly = true)
    public Address getAddressById(Long addressId) {

        return addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found with ID: " + addressId));
    }

    // Get all addresses belonging to a user
    @Override
    @Transactional(readOnly = true)
    public List<Address> getAddressesByUserId(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User not found with ID: " + userId);
        }

        return addressRepository.findByUser_Id(userId);
    }

    // Update an existing address
    @Override
    public Address updateAddress(Long addressId, Address address) {

        Address existing = getAddressById(addressId);

        existing.setName(address.getName());
        existing.setLocality(address.getLocality());
        existing.setAddress(address.getAddress());
        existing.setCity(address.getCity());
        existing.setCountry(address.getCountry());
        existing.setState(address.getState());
        existing.setZipcode(address.getZipcode());
        existing.setMobile(address.getMobile());

        return addressRepository.save(existing);
    }

    // Delete address by ID
    @Override
    public void deleteAddress(Long addressId) {

        Address existing = getAddressById(addressId);

        addressRepository.delete(existing);
    }
}