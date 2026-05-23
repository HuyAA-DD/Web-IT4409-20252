package com.webtechnology.ecommerce.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.webtechnology.ecommerce.dto.FileUploadResponse;
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
import com.webtechnology.ecommerce.service.FileUploadService;
import com.webtechnology.ecommerce.service.ProductService;
import com.webtechnology.ecommerce.enums.ProductStatus;

import lombok.RequiredArgsConstructor;

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
    private final FileUploadService fileUploadService;

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
    public List<ProductResponse> searchProducts(String keyword, UUID categoryId, UUID sellerId,
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String sortDir) {
        return sortProductResponses(productRepository.searchProducts(keyword, categoryId, sellerId, null, minPrice, maxPrice)
                .stream()
                .map(this::buildProductResponse)
                .toList(), sortBy, sortDir);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> filterProducts(UUID categoryId, ProductStatus status, UUID sellerId,
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String sortDir) {
        return sortProductResponses(productRepository.searchProducts(null, categoryId, sellerId, status, minPrice, maxPrice)
                .stream()
                .map(this::buildProductResponse)
                .toList(), sortBy, sortDir);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        return buildProductResponse(findProductById(id));
    }

    private List<ProductResponse> sortProductResponses(List<ProductResponse> products, String sortBy, String sortDir) {
        Comparator<ProductResponse> comparator = getProductComparator(sortBy);
        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        return products.stream()
                .sorted(comparator)
                .toList();
    }

    private Comparator<ProductResponse> getProductComparator(String sortBy) {
        if ("name".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(p -> p.getName() == null ? "" : p.getName().toLowerCase());
        }
        if ("price".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(this::getLowestVariantPrice);
        }
        return Comparator.comparing(ProductResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private BigDecimal getLowestVariantPrice(ProductResponse product) {
        return product.getVariants() == null ? BigDecimal.ZERO : product.getVariants().stream()
                .map(v -> v.getPrice() == null ? BigDecimal.ZERO : v.getPrice())
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
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

    @Override
    public FileUploadResponse uploadProductImage(UUID productId, MultipartFile file) {
        Product product = findProductById(productId);
        FileUploadResponse uploadResponse = fileUploadService.uploadImage(file);

        ProductImage productImage = ProductImage.builder()
                .product(product)
                .imageUrl(uploadResponse.getUrl())
                .build();
        productImageRepository.save(productImage);

        return uploadResponse;
    }

    @Override
    public List<FileUploadResponse> uploadProductImages(UUID productId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one image must be provided");
        }

        Product product = findProductById(productId);
        List<FileUploadResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            FileUploadResponse uploadResponse = fileUploadService.uploadImage(file);

            ProductImage productImage = ProductImage.builder()
                    .product(product)
                    .imageUrl(uploadResponse.getUrl())
                    .build();
            productImageRepository.save(productImage);
            responses.add(uploadResponse);
        }

        return responses;
    }

    @Override
    public void deleteProductImage(UUID productId, UUID imageId) {
        findProductById(productId);
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));

        if (!productImage.getProduct().getId().equals(productId)) {
            throw new BadRequestException("Image does not belong to this product");
        }

        productImageRepository.delete(productImage);
    }
}
