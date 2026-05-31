package com.webtechnology.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayCheckoutRequest {

    @NotNull(message = "Order ID cannot be null")
    private UUID orderId;
}
