package com.webtechnology.ecommerce.mapper;

import com.webtechnology.ecommerce.dto.AddressRequest;
import com.webtechnology.ecommerce.dto.AddressResponse;
import com.webtechnology.ecommerce.entity.Address;
import com.webtechnology.ecommerce.entity.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T14:41:27+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AddressMapperImpl implements AddressMapper {

    @Override
    public AddressResponse toResponse(Address address) {
        if ( address == null ) {
            return null;
        }

        AddressResponse.AddressResponseBuilder addressResponse = AddressResponse.builder();

        addressResponse.userId( addressUserId( address ) );
        addressResponse.addressType( address.getAddressType() );
        addressResponse.country( address.getCountry() );
        addressResponse.createdAt( address.getCreatedAt() );
        addressResponse.district( address.getDistrict() );
        addressResponse.id( address.getId() );
        addressResponse.isDefault( address.getIsDefault() );
        addressResponse.postalCode( address.getPostalCode() );
        addressResponse.province( address.getProvince() );
        addressResponse.recipientName( address.getRecipientName() );
        addressResponse.recipientPhone( address.getRecipientPhone() );
        addressResponse.street( address.getStreet() );
        addressResponse.updatedAt( address.getUpdatedAt() );
        addressResponse.ward( address.getWard() );

        return addressResponse.build();
    }

    @Override
    public Address toEntity(AddressRequest request) {
        if ( request == null ) {
            return null;
        }

        Address.AddressBuilder address = Address.builder();

        address.addressType( request.getAddressType() );
        address.country( request.getCountry() );
        address.district( request.getDistrict() );
        address.isDefault( request.getIsDefault() );
        address.postalCode( request.getPostalCode() );
        address.province( request.getProvince() );
        address.recipientName( request.getRecipientName() );
        address.recipientPhone( request.getRecipientPhone() );
        address.street( request.getStreet() );
        address.ward( request.getWard() );

        return address.build();
    }

    @Override
    public void updateEntityFromRequest(AddressRequest request, Address address) {
        if ( request == null ) {
            return;
        }

        if ( request.getAddressType() != null ) {
            address.setAddressType( request.getAddressType() );
        }
        if ( request.getCountry() != null ) {
            address.setCountry( request.getCountry() );
        }
        if ( request.getDistrict() != null ) {
            address.setDistrict( request.getDistrict() );
        }
        if ( request.getIsDefault() != null ) {
            address.setIsDefault( request.getIsDefault() );
        }
        if ( request.getPostalCode() != null ) {
            address.setPostalCode( request.getPostalCode() );
        }
        if ( request.getProvince() != null ) {
            address.setProvince( request.getProvince() );
        }
        if ( request.getRecipientName() != null ) {
            address.setRecipientName( request.getRecipientName() );
        }
        if ( request.getRecipientPhone() != null ) {
            address.setRecipientPhone( request.getRecipientPhone() );
        }
        if ( request.getStreet() != null ) {
            address.setStreet( request.getStreet() );
        }
        if ( request.getWard() != null ) {
            address.setWard( request.getWard() );
        }
    }

    private UUID addressUserId(Address address) {
        if ( address == null ) {
            return null;
        }
        User user = address.getUser();
        if ( user == null ) {
            return null;
        }
        UUID id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
