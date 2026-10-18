package com.Karthik.controller;

import com.Karthik.model.Address;
import com.Karthik.model.User;
import com.Karthik.repository.AddressRepository;
import com.Karthik.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressController(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public record SaveAddressRequest(
            String fullName,
            String mobile,
            String house,
            String street,
            String landmark,
            String city,
            String state,
            String postalCode,
            String instructions) {}

    @PostMapping("/user/{userId}")
    @Transactional
    public Address saveAddress(
            @PathVariable Long userId,
            @RequestBody SaveAddressRequest request,
            Authentication authentication) {

        User customer = authenticatedUser(authentication);
        if (customer.getId() == null || !customer.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can save addresses only for your own account");
        }
        validate(request);

        Address address = new Address();
        address.setName(request.fullName().trim());
        address.setMobile(request.mobile().trim());
        address.setLocality(request.street().trim());
        String addressLine = request.house().trim();
        if (request.landmark() != null && !request.landmark().isBlank()) {
            addressLine += ", Landmark: " + request.landmark().trim();
        }
        address.setAddress(addressLine);
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setCountry("India");
        address.setZipcode(request.postalCode().trim());
        address.setUser(customer);

        return addressRepository.save(address);
    }

    @GetMapping("/user/{userId}")
    @Transactional(readOnly = true)
    public List<Address> getCustomerAddresses(
            @PathVariable Long userId,
            Authentication authentication) {
        User customer = authenticatedUser(authentication);
        if (customer.getId() == null || !customer.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can view addresses only for your own account");
        }
        return addressRepository.findByUser_Id(userId);
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
    }

    private void validate(SaveAddressRequest request) {
        if (request == null || blank(request.fullName()) || blank(request.mobile())
                || blank(request.house()) || blank(request.street()) || blank(request.city())
                || blank(request.state()) || blank(request.postalCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please provide all required delivery address fields");
        }
        if (!request.mobile().trim().matches("^[6-9]\\d{9}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enter a valid 10-digit Indian mobile number");
        }
        if (!request.postalCode().trim().matches("^\\d{6}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enter a valid 6-digit PIN code");
        }
        if (request.fullName().length() > 100 || request.mobile().length() > 20
                || request.house().length() > 255 || request.street().length() > 255
                || (request.landmark() != null && request.landmark().length() > 200)
                || request.city().length() > 100 || request.state().length() > 100
                || request.postalCode().length() > 20
                || (request.instructions() != null && request.instructions().length() > 1000)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "One or more address fields exceed the allowed length");
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
