package com.webtechnology.ecommerce.service.impl;

import com.webtechnology.ecommerce.dto.ProductRequest;
import com.webtechnology.ecommerce.dto.ProductResponse;
import com.webtechnology.ecommerce.entity.Category;
import com.webtechnology.ecommerce.entity.Product;
import com.webtechnology.ecommerce.entity.ProductImage;
import com.webtechnology.ecommerce.entity.ProductVariant;
import com.webtechnology.ecommerce.entity.User;
import com.webtechnology.ecommerce.exception.BadRequestException;
import com.webtechnology.ecommerce.exception.ResourceNotFoundException;
import com.webtechnology.ecommerce.mapper.ProductMapper;
import com.webtechnology.ecommerce.repository.CategoryRepository;
import com.webtechnology.ecommerce.repository.ProductImageRepository;
import com.webtechnology.ecommerce.repository.ProductRepository;
import com.webtechnology.ecommerce.repository.ProductVariantRepository;
import com.webtechnology.ecommerce.repository.UserRepository;
import com.webtechnology.ecommerce.service.ProductService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        validateVariantSkus(request);

        Product product = productMapper.toEntity(request);
        product.setCategory(findCategoryById(request.getCategoryId()));
        product.setSeller(findUserById(request.getSellerId()));
        Product savedProduct = productRepository.save(product);

        saveImages(savedProduct, request.getImageUrls());
        saveVariants(savedProduct, request);

        return buildProductResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::buildProductResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        return buildProductResponse(findProductById(id));
    }

    @Override
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        validateVariantSkus(request);

        Product existingProduct = findProductById(id);
        productMapper.updateEntityFromRequest(request, existingProduct);
        existingProduct.setCategory(findCategoryById(request.getCategoryId()));
        existingProduct.setSeller(findUserById(request.getSellerId()));
        Product savedProduct = productRepository.save(existingProduct);

        productImageRepository.deleteByProductId(id);
        productVariantRepository.deleteByProductId(id);
        saveImages(savedProduct, request.getImageUrls());
        saveVariants(savedProduct, request);

        return buildProductResponse(savedProduct);
    }

    @Override
    public void deleteProduct(UUID id) {
        Product product = findProductById(id);
        productImageRepository.deleteByProductId(id);
        productVariantRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private ProductResponse buildProductResponse(Product product) {
        ProductResponse response = productMapper.toResponse(product);
        response.setImageUrls(productImageRepository.findByProductId(product.getId())
                .stream()
                .map(ProductImage::getImageUrl)
                .toList());
        response.setVariants(productVariantRepository.findByProductId(product.getId())
                .stream()
                .map(productMapper::toVariantResponse)
                .toList());
        return response;
    }

    private void saveImages(Product product, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        List<ProductImage> images = imageUrls.stream()
                .map(imageUrl -> ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .build())
                .toList();
        productImageRepository.saveAll(images);
    }

    private void saveVariants(Product product, ProductRequest request) {
        List<ProductVariant> variants = request.getVariants().stream()
                .map(productMapper::toVariantEntity)
                .peek(variant -> variant.setProduct(product))
                .toList();
        productVariantRepository.saveAll(variants);
    }

    private void validateVariantSkus(ProductRequest request) {
        long distinctCount = request.getVariants().stream()
                .map(variant -> variant.getSku().trim().toUpperCase())
                .distinct()
                .count();
        if (distinctCount != request.getVariants().size()) {
            throw new BadRequestException("Duplicate SKUs are not allowed in a product request");
        }
    }

    private Product findProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
