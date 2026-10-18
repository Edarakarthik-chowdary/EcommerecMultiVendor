package com.Karthik.controller;

import com.Karthik.model.Order;
import com.Karthik.model.User;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping("/user/{userId}")
    public Order placeOrder(
            @PathVariable Long userId,
            @RequestParam(required = false) Long addressId,
            Authentication authentication) {

        User customer = authenticatedUser(authentication);
        requireSameCustomer(customer, userId);

        return addressId == null
                ? orderService.placeOrder(customer.getId())
                : orderService.placeOrder(customer.getId(), addressId);
    }

    @GetMapping("/{orderId}")
    public Order getOrderById(@PathVariable Long orderId, Authentication authentication) {
        Order order = orderService.getOrderById(orderId);
        requireOrderAccess(order, authenticatedUser(authentication));
        return order;
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(
            @PathVariable Long userId,
            Authentication authentication) {

        User customer = authenticatedUser(authentication);
        requireSameCustomer(customer, userId);
        return orderService.getOrdersByUserId(customer.getId());
    }

    @GetMapping
    public List<Order> getAllOrders(Authentication authentication) {
        if (authentication == null ||
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access required");
        }
        return orderService.getAllOrders();
    }

    @PutMapping("/{orderId}/cancel")
    public Order cancelOrder(@PathVariable Long orderId, Authentication authentication) {
        Order order = orderService.getOrderById(orderId);
        requireOrderAccess(order, authenticatedUser(authentication));
        return orderService.cancelOrder(orderId);
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
    }

    private void requireSameCustomer(User customer, Long requestedUserId) {
        if (customer.getId() == null || !customer.getId().equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own orders");
        }
    }

    private void requireOrderAccess(Order order, User customer) {
        if (order.getUser() == null || order.getUser().getId() == null
                || !order.getUser().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own orders");
        }
    }
}
