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
    date = "2026-04-19T22:54:17+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Ubuntu)"
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
        addressResponse.id( address.getId() );
        addressResponse.recipientName( address.getRecipientName() );
        addressResponse.recipientPhone( address.getRecipientPhone() );
        addressResponse.street( address.getStreet() );
        addressResponse.ward( address.getWard() );
        addressResponse.district( address.getDistrict() );
        addressResponse.province( address.getProvince() );
        addressResponse.postalCode( address.getPostalCode() );
        addressResponse.country( address.getCountry() );
        addressResponse.isDefault( address.getIsDefault() );
        addressResponse.addressType( address.getAddressType() );
        addressResponse.createdAt( address.getCreatedAt() );
        addressResponse.updatedAt( address.getUpdatedAt() );

        return addressResponse.build();
    }

    @Override
    public Address toEntity(AddressRequest request) {
        if ( request == null ) {
            return null;
        }

        Address.AddressBuilder address = Address.builder();

        address.recipientName( request.getRecipientName() );
        address.recipientPhone( request.getRecipientPhone() );
        address.street( request.getStreet() );
        address.ward( request.getWard() );
        address.district( request.getDistrict() );
        address.province( request.getProvince() );
        address.postalCode( request.getPostalCode() );
        address.country( request.getCountry() );
        address.isDefault( request.getIsDefault() );
        address.addressType( request.getAddressType() );

        return address.build();
    }

    @Override
    public void updateEntityFromRequest(AddressRequest request, Address address) {
        if ( request == null ) {
            return;
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
        if ( request.getDistrict() != null ) {
            address.setDistrict( request.getDistrict() );
        }
        if ( request.getProvince() != null ) {
            address.setProvince( request.getProvince() );
        }
        if ( request.getPostalCode() != null ) {
            address.setPostalCode( request.getPostalCode() );
        }
        if ( request.getCountry() != null ) {
            address.setCountry( request.getCountry() );
        }
        if ( request.getIsDefault() != null ) {
            address.setIsDefault( request.getIsDefault() );
        }
        if ( request.getAddressType() != null ) {
            address.setAddressType( request.getAddressType() );
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
