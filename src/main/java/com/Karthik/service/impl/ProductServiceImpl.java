package com.Karthik.service.impl;

import com.Karthik.domain.AccountStatus;
import com.Karthik.model.Brand;
import com.Karthik.model.Category;
import com.Karthik.model.Product;
import com.Karthik.model.Seller;
import com.Karthik.repository.BrandRepository;
import com.Karthik.repository.CategoryRepository;
import com.Karthik.repository.ProductRepository;
import com.Karthik.repository.SellerRepository;
import com.Karthik.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              SellerRepository sellerRepository,
                              CategoryRepository categoryRepository,
                              BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    private Seller getActiveSeller(String email) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Seller not found: " + email));

        if (seller.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Seller account is not active");
        }
        return seller;
    }

    private Product getOwnedProduct(Long id, Seller seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));

        if (product.getSeller() == null
                || !product.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot modify another seller's product");
        }
        return product;
    }

    private void validateProduct(Product product) {
        if (product.getTitle() == null || product.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Product title is required");
        }

        if (product.getMrpPrice() == null || product.getSellingPrice() == null
                || product.getMrpPrice().compareTo(BigDecimal.ZERO) <= 0
                || product.getSellingPrice().compareTo(BigDecimal.ZERO) <= 0
                || product.getSellingPrice().compareTo(product.getMrpPrice()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Enter valid product prices");
        }

        if (product.getQuantity() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Quantity cannot be negative");
        }

        if (product.getDiscountPercentage() < 0
                || product.getDiscountPercentage() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Discount must be between 0 and 100");
        }
    }

    private Category resolveCategory(Product product) {
        if (product.getCategory() == null
                || product.getCategory().getId() == null) {
            return null;
        }

        return categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Category not found"));
    }

    private Brand resolveBrand(Product product, Category category) {
        if (product.getBrand() == null || product.getBrand().getId() == null) {
            return null;
        }

        Brand brand = brandRepository.findById(product.getBrand().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Brand not found"));

        // Enforce the association only when this brand has configured categories.
        if (category != null && brand.getCategories() != null
                && !brand.getCategories().isEmpty()) {
            boolean categoryAllowed = brand.getCategories().stream()
                    .anyMatch(brandCategory -> brandCategory.getId() != null
                            && brandCategory.getId().equals(category.getId()));

            if (!categoryAllowed) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected brand is not associated with the selected category");
            }
        }

        return brand;
    }

    @Override
    public Product createProduct(Product product, String sellerEmail) {
        Seller seller = getActiveSeller(sellerEmail);
        validateProduct(product);

        product.setId(null);
        product.setSeller(seller);
        product.setCreatedAt(null);

        Category category = resolveCategory(product);
        product.setCategory(category);
        product.setBrand(resolveBrand(product, category));

        return productRepository.save(product);
    }

    public Product createProductAsAdmin(Product product) {
        validateProduct(product);

        product.setId(null);
        product.setCreatedAt(null);

        Category category = resolveCategory(product);
        product.setCategory(category);
        product.setBrand(resolveBrand(product, category));

        if (product.getSeller() != null && product.getSeller().getId() != null) {
            Seller seller = sellerRepository.findById(product.getSeller().getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Seller not found"));
            product.setSeller(seller);
        } else {
            product.setSeller(null);
        }

        return productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsBySeller(String sellerEmail) {
        Seller seller = getActiveSeller(sellerEmail);
        return productRepository.findBySellerId(seller.getId());
    }

    @Override
    public Product updateProduct(Long id, Product product, String sellerEmail) {
        Seller seller = getActiveSeller(sellerEmail);
        Product existing = getOwnedProduct(id, seller);
        copyEditableFields(existing, product);

        if (product.getCategory() != null
                && product.getCategory().getId() != null) {
            Category category = resolveCategory(product);
            existing.setCategory(category);

            // Only change the brand when the request includes a brand field.
            if (product.getBrand() != null) {
                existing.setBrand(resolveBrand(product, category));
            }
        }

        return productRepository.save(existing);
    }

    public Product updateProductAsAdmin(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));

        copyEditableFields(existing, product);

        Category category = resolveCategory(product);
        existing.setCategory(category);
        existing.setBrand(resolveBrand(product, category));

        // Admin updates may change the seller, but only to an existing seller.
        if (product.getSeller() != null && product.getSeller().getId() != null) {
            Seller seller = sellerRepository.findById(product.getSeller().getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Seller not found"));
            existing.setSeller(seller);
        }

        return productRepository.save(existing);
    }

    private void copyEditableFields(Product existing, Product incoming) {
        validateProduct(incoming);
        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription());
        existing.setMrpPrice(incoming.getMrpPrice());
        existing.setSellingPrice(incoming.getSellingPrice());
        existing.setDiscountPercentage(incoming.getDiscountPercentage());
        existing.setQuantity(incoming.getQuantity());
        existing.setColor(incoming.getColor());
        existing.setImages(incoming.getImages());
        existing.setSizes(incoming.getSizes());
    }

    @Override
    public void deleteProduct(Long id, String sellerEmail) {
        Seller seller = getActiveSeller(sellerEmail);
        productRepository.delete(getOwnedProduct(id, seller));
    }

    public void deleteProductAsAdmin(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + id));
        productRepository.delete(product);
    }
}