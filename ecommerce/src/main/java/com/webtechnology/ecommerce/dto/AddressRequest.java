package com.webtechnology.ecommerce.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    private UUID userId;

    private String recipientName;

    private String recipientPhone;

    private String street;

    private String ward;

    private String district;

    private String province;

    private String postalCode;

    private String country;

    private Boolean isDefault;

    private String addressType;
}
