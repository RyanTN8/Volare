package com.volare.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RestaurantDTO(
        String id,
        String name,
        String imageUrl,
        String url,
        double rating,
        int reviewCount,
        String priceRange,
        List<String> categories,
        Location location,
        String phone,
        boolean isClosed,
        double distanceMeters,
        List<String> tags
) {
    public record Location(
            String address,
            String city,
            String state,
            String country,
            double latitude,
            double longitude
    ) {}
}
