package com.webtechnology.ecommerce.dto;

import com.webtechnology.ecommerce.enums.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must not exceed 200 characters")
    private String name;

    private String description;

    @NotNull(message = "Category id is required")
    private UUID categoryId;

    @NotNull(message = "Seller id is required")
    private UUID sellerId;

    private ProductStatus status;

    private List<@NotBlank(message = "Image URL must not be blank") String> imageUrls;

    @Valid
    @NotEmpty(message = "At least one variant is required")
    private List<ProductVariantRequest> variants;
}
