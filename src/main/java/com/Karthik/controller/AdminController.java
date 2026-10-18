package com.Karthik.controller;

import com.Karthik.model.Order;
import com.Karthik.model.Product;
import com.Karthik.model.User;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.UserRepository;
import com.Karthik.service.OrderService;
import com.Karthik.service.ProductService;
import com.Karthik.service.impl.ProductServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;
    private final ProductServiceImpl productServiceImpl;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminController(
            OrderService orderService,
            ProductService productService,
            ProductServiceImpl productServiceImpl,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.productService = productService;
        this.productServiceImpl = productServiceImpl;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(Authentication authentication) {
        requireAdmin(authentication);
        List<Order> orders = orderService.getAllOrders();
        List<Product> products = productService.getAllProducts();
        List<User> users = userRepository.findAll();

        BigDecimal paidRevenue = orders.stream()
                .filter(order -> "SUCCESS".equalsIgnoreCase(order.getPaymentStatus()))
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long openOrders = orders.stream()
                .filter(order -> {
                    String status = order.getOrderStatus();
                    return status == null || (!"DELIVERED".equalsIgnoreCase(status)
                            && !"CANCELLED".equalsIgnoreCase(status));
                }).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", orders.size());
        result.put("openOrders", openOrders);
        result.put("totalProducts", products.size());
        result.put("totalUsers", users.size());
        result.put("paidRevenue", paidRevenue);
        return result;
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders(Authentication authentication) {
        requireAdmin(authentication);
        return orderService.getAllOrders();
    }

    @GetMapping("/products")
    public List<Product> getAllProducts(Authentication authentication) {
        requireAdmin(authentication);
        return productService.getAllProducts();
    }

    /*
     * Admins may create catalogue entries without impersonating a seller.
     * Category/seller relationships are accepted only when their IDs exist.
     */
    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@RequestBody Product product,
                                 Authentication authentication) {
        requireAdmin(authentication);
        return productServiceImpl.createProductAsAdmin(product);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id,
                                 @RequestBody Product product,
                                 Authentication authentication) {
        requireAdmin(authentication);
        return productServiceImpl.updateProductAsAdmin(id, product);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id,
                              Authentication authentication) {
        requireAdmin(authentication);
        productServiceImpl.deleteProductAsAdmin(id);
    }

    @GetMapping("/users")
    public List<User> getAllUsers(Authentication authentication) {
        requireAdmin(authentication);
        return userRepository.findAll();
    }

    private void requireAdmin(Authentication authentication) {
        boolean isAdmin = authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!isAdmin) {
            throw new ResponseStatusException(
                    authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN,
                    "Administrator access required");
        }
    }
}