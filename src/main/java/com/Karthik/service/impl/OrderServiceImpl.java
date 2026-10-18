package com.Karthik.service.impl;

import com.Karthik.model.Address;
import com.Karthik.model.Cart;
import com.Karthik.model.CartItem;
import com.Karthik.model.Order;
import com.Karthik.model.OrderItem;
import com.Karthik.model.Product;
import com.Karthik.model.User;

import com.Karthik.repository.AddressRepository;
import com.Karthik.repository.CartItemRepository;
import com.Karthik.repository.CartRepository;
import com.Karthik.repository.OrderRepository;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.UserRepository;

import com.Karthik.service.OrderService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            AddressRepository addressRepository) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
    }

    @Override
    public Order placeOrder(Long userId) {
        return placeOrder(userId, null);
    }

    @Override
    public Order placeOrder(Long userId, Long addressId) {

        // Find customer.
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found: " + userId
                        )
                );

        // Find customer's cart.
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Cart not found for user: " + userId
                        )
                );

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot place an order with an empty cart"
            );
        }

        Order order = new Order();
        order.setUser(user);

        // Validate delivery address ownership.
        if (addressId != null) {
            Address address = addressRepository.findById(addressId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Delivery address not found"
                            )
                    );

            if (address.getUser() == null
                    || !address.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException(
                        "Delivery address does not belong to this customer"
                );
            }

            order.setShippingAddress(address);
        }

        List<OrderItem> orderItems = new ArrayList<>();

        BigDecimal totalMrpPrice = BigDecimal.ZERO;
        BigDecimal totalSellingPrice = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            if (cartItem.getProduct() == null
                    || cartItem.getProduct().getId() == null) {
                throw new IllegalStateException(
                        "Cart contains an invalid product"
                );
            }

            Product product = productRepository
                    .findById(cartItem.getProduct().getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: "
                                            + cartItem.getProduct().getId()
                            )
                    );

            int quantity = cartItem.getQuantity();

            if (quantity <= 0) {
                throw new IllegalArgumentException(
                        "Invalid quantity for product: "
                                + product.getTitle()
                );
            }

            if (product.getQuantity() < quantity) {
                throw new IllegalStateException(
                        "Insufficient stock for product: "
                                + product.getTitle()
                );
            }

            /*
             * IMPORTANT:
             * These values must come from trusted product pricing
             * fields in the backend, not from client-controlled cart data.
             *
             * Replace product.getMrpPrice() and product.getSellingPrice()
             * below if your Product entity uses different getter names.
             */
            BigDecimal mrpPrice = product.getMrpPrice();
            BigDecimal sellingPrice = product.getSellingPrice();

            if (mrpPrice == null || sellingPrice == null
                    || mrpPrice.signum() < 0
                    || sellingPrice.signum() < 0
                    || sellingPrice.compareTo(mrpPrice) > 0) {
                throw new IllegalStateException(
                        "Invalid product pricing: " + product.getTitle()
                );
            }

            BigDecimal itemQuantity = BigDecimal.valueOf(quantity);

            BigDecimal mrpSubtotal =
                    mrpPrice.multiply(itemQuantity);

            BigDecimal sellingSubtotal =
                    sellingPrice.multiply(itemQuantity);

            totalMrpPrice = totalMrpPrice.add(mrpSubtotal);
            totalSellingPrice = totalSellingPrice.add(sellingSubtotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setMrpPrice(mrpPrice);
            orderItem.setSellingPrice(sellingPrice);
            orderItem.setSubtotal(sellingSubtotal);

            orderItems.add(orderItem);
        }

        BigDecimal discount =
                totalMrpPrice.subtract(totalSellingPrice);

        order.setOrderItems(orderItems);
        order.setTotalMrpPrice(totalMrpPrice);
        order.setTotalSellingPrice(totalSellingPrice);
        order.setDiscount(discount);

        order.setTax(BigDecimal.ZERO);
        order.setShippingCharge(BigDecimal.ZERO);

        BigDecimal totalAmount = totalSellingPrice
                .add(order.getTax())
                .add(order.getShippingCharge());

        if (totalAmount.signum() <= 0) {
            throw new IllegalStateException(
                    "Order total must be greater than zero"
            );
        }

        order.setTotalAmount(totalAmount);
        order.setOrderStatus("PENDING");
        order.setPaymentStatus("PENDING");

        // Inventory is not deducted until payment is confirmed.
        Order savedOrder = orderRepository.save(order);

        // Keep the cart intact until verified payment.
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found: " + userId
                        )
                );

        return orderRepository.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order cancelOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId
                        )
                );

        if ("SUCCESS".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException(
                    "This order has been paid. Use the refund process instead."
            );
        }

        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            return order;
        }

        if ("SHIPPED".equalsIgnoreCase(order.getOrderStatus())
                || "DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException(
                    "Shipped or delivered orders cannot be cancelled here"
            );
        }

        order.setOrderStatus("CANCELLED");
        order.setCancelledAt(java.time.LocalDateTime.now());
        order.setCancellationReason(
                "Cancelled before successful payment"
        );

        return orderRepository.save(order);
    }
}