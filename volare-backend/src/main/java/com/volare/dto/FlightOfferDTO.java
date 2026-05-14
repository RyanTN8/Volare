package com.volare.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FlightOfferDTO(
        String id,
        String source,
        boolean oneWay,
        int numberOfBookableSeats,
        List<Itinerary> itineraries,
        Price price,
        String validatingAirlineCodes
) {
    public record Itinerary(
            String duration,
            List<Segment> segments
    ) {}

    public record Segment(
            String departureIataCode,
            String departureTime,
            String arrivalIataCode,
            String arrivalTime,
            String carrierCode,
            String flightNumber,
            String aircraft,
            String duration,
            int numberOfStops
    ) {}

    public record Price(
            String currency,
            String total,
            String base,
            List<FeeDetail> fees
    ) {}

    public record FeeDetail(String amount, String type) {}
}
