package com.Karthik.service;

import com.Karthik.model.Order;

import java.util.List;

public interface OrderService {

    Order placeOrder(Long userId);

    Order placeOrder(Long userId, Long addressId);

    Order getOrderById(Long orderId);

    List<Order> getOrdersByUserId(Long userId);

    List<Order> getAllOrders();

    Order cancelOrder(Long orderId);
}