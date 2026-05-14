package com.volare.dto.duffel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Response shape for {@code POST /air/offer_requests?return_offers=true}.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DuffelOfferRequestResponse(Data data) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String id, List<Offer> offers) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Offer(
            String id,
            @JsonProperty("total_amount") String totalAmount,
            @JsonProperty("total_currency") String totalCurrency,
            @JsonProperty("base_amount") String baseAmount,
            @JsonProperty("base_currency") String baseCurrency,
            @JsonProperty("tax_amount") String taxAmount,
            @JsonProperty("tax_currency") String taxCurrency,
            Owner owner,
            List<Slice> slices
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Owner(
            @JsonProperty("iata_code") String iataCode,
            String name
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Slice(
            String duration,
            List<Segment> segments
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Segment(
            Place origin,
            Place destination,
            @JsonProperty("departing_at") String departingAt,
            @JsonProperty("arriving_at") String arrivingAt,
            @JsonProperty("marketing_carrier") Carrier marketingCarrier,
            @JsonProperty("marketing_carrier_flight_number") String marketingCarrierFlightNumber,
            Aircraft aircraft,
            String duration,
            List<Stop> stops
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Place(
            @JsonProperty("iata_code") String iataCode,
            String name
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Carrier(
            @JsonProperty("iata_code") String iataCode,
            String name
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Aircraft(
            @JsonProperty("iata_code") String iataCode,
            String name
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Stop(String id) {}
}
