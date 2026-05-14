package com.volare.dto.foursquare;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FoursquarePlacesResponse(List<Place> results) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Place(
            @JsonProperty("fsq_id") String fsqId,
            String name,
            List<Category> categories,
            @JsonProperty("closed_bucket") String closedBucket,
            Integer distance,
            Geocodes geocodes,
            Hours hours,
            Location location,
            List<Photo> photos,
            Double popularity,
            Integer price,
            Double rating,
            String tel,
            String website
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Category(
            int id,
            String name,
            @JsonProperty("short_name") String shortName,
            Icon icon
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Icon(String prefix, String suffix) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Geocodes(Main main) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Main(double latitude, double longitude) {}

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
