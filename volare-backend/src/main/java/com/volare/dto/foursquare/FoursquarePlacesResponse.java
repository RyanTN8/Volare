package com.volare.dto.foursquare;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Maps the Foursquare Places API (places-api.foursquare.com) response.
 * Note: {@code latitude}/{@code longitude} are top-level on a place in this API
 * (the legacy v3 {@code geocodes.main} nesting is gone).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record FoursquarePlacesResponse(List<Place> results) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Place(
            @JsonProperty("fsq_place_id") String fsqId,
            String name,
            List<Category> categories,
            Integer distance,
            Double latitude,
            Double longitude,
            Location location,
            // Premium fields — null unless the account spends API credits to request them.
            @JsonProperty("closed_bucket") String closedBucket,
            Hours hours,
            List<Photo> photos,
            Double popularity,
            Integer price,
            Double rating,
            String tel,
            String website
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Category(
            @JsonProperty("fsq_category_id") String fsqCategoryId,
            String name,
            @JsonProperty("short_name") String shortName,
            Icon icon
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Icon(String prefix, String suffix) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hours(
            String display,
            @JsonProperty("open_now") Boolean openNow,
            @JsonProperty("is_local_holiday") Boolean isLocalHoliday
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Location(
            String address,
            @JsonProperty("address_extended") String addressExtended,
            String country,
            @JsonProperty("cross_street") String crossStreet,
            @JsonProperty("formatted_address") String formattedAddress,
            String locality,
            String postcode,
            String region
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Photo(
            String id,
            String prefix,
            String suffix,
            int width,
            int height
    ) {}
}
