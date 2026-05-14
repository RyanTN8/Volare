package com.volare.clients;

import com.volare.config.CacheConfig;
import com.volare.dto.FlightOfferDTO;
import com.volare.dto.duffel.DuffelOfferRequestResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Component
public class DuffelClient {

    private static final Logger log = LoggerFactory.getLogger(DuffelClient.class);

    // Duffel pins behaviour to an API version via this header.
    private static final String DUFFEL_API_VERSION = "v2";
    private static final String DEFAULT_CABIN_CLASS = "economy";

    private final WebClient webClient;

    public DuffelClient(
            WebClient.Builder webClientBuilder,
            @Value("${duffel.base-url}") String baseUrl,
            @Value("${duffel.api-token}") String apiToken
    ) {
        // Duffel uses a single static access token — no OAuth token exchange needed.
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiToken)
                .defaultHeader("Duffel-Version", DUFFEL_API_VERSION)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @CircuitBreaker(name = "duffel", fallbackMethod = "flightSearchFallback")
    @Retry(name = "duffel")
    @Cacheable(value = CacheConfig.DUFFEL_FLIGHT_CACHE,
               key = "#origin + '-' + #destination + '-' + #departureDate + '-' + #returnDate + '-' + #passengers")
    public Mono<List<FlightOfferDTO>> searchFlights(
            String origin, String destination, String departureDate,
            String returnDate, int passengers
    ) {
        List<Map<String, Object>> slices = new ArrayList<>();
        slices.add(slice(origin, destination, departureDate));
        if (returnDate != null) {
            slices.add(slice(destination, origin, returnDate));
        }

        List<Map<String, String>> passengerList = IntStream.range(0, passengers)
                .mapToObj(i -> Map.of("type", "adult"))
                .toList();

        Map<String, Object> body = Map.of("data", Map.of(
                "slices", slices,
                "passengers", passengerList,
                "cabin_class", DEFAULT_CABIN_CLASS
        ));

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/air/offer_requests")
                        .queryParam("return_offers", true)
                        .build())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(DuffelOfferRequestResponse.class)
                .map(resp -> {
                    if (resp.data() == null || resp.data().offers() == null) {
                        return List.<FlightOfferDTO>of();
                    }
                    return resp.data().offers().stream().map(this::mapToDTO).toList();
                })
                .doOnError(e -> log.error("Duffel flight search error: {}", e.getMessage()));
    }

    private Map<String, Object> slice(String origin, String destination, String departureDate) {
        return Map.of(
                "origin", origin.toUpperCase(),
                "destination", destination.toUpperCase(),
                "departure_date", departureDate
        );
    }

    private FlightOfferDTO mapToDTO(DuffelOfferRequestResponse.Offer offer) {
        List<DuffelOfferRequestResponse.Slice> slices =
                offer.slices() != null ? offer.slices() : List.of();

        return FlightOfferDTO.builder()
                .id(offer.id())
                .source("Duffel")
                .oneWay(slices.size() <= 1)
                // Duffel offers do not expose a bookable-seat count.
                .numberOfBookableSeats(0)
                .itineraries(slices.stream().map(this::mapItinerary).toList())
                .price(new FlightOfferDTO.Price(
                        offer.totalCurrency(),
                        offer.totalAmount(),
                        offer.baseAmount(),
                        offer.taxAmount() != null
                                ? List.of(new FlightOfferDTO.FeeDetail(offer.taxAmount(), "TAX"))
                                : List.of()
                ))
                .validatingAirlineCodes(offer.owner() != null ? offer.owner().iataCode() : null)
                .build();
    }

    private FlightOfferDTO.Itinerary mapItinerary(DuffelOfferRequestResponse.Slice slice) {
        return new FlightOfferDTO.Itinerary(
                slice.duration(),
                slice.segments() != null
                        ? slice.segments().stream().map(this::mapSegment).toList()
                        : List.of()
        );
    }

    private FlightOfferDTO.Segment mapSegment(DuffelOfferRequestResponse.Segment s) {
        return new FlightOfferDTO.Segment(
                s.origin() != null ? s.origin().iataCode() : null,
                s.departingAt(),
                s.destination() != null ? s.destination().iataCode() : null,
                s.arrivingAt(),
                s.marketingCarrier() != null ? s.marketingCarrier().iataCode() : null,
                s.marketingCarrierFlightNumber(),
                s.aircraft() != null ? s.aircraft().iataCode() : null,
                s.duration(),
                s.stops() != null ? s.stops().size() : 0
        );
    }

    @SuppressWarnings("unused")
    public Mono<List<FlightOfferDTO>> flightSearchFallback(
            String origin, String destination, String departureDate,
            String returnDate, int passengers, Throwable t
    ) {
        log.warn("Duffel circuit breaker open: {}", t.getMessage());
        return Mono.just(List.of());
    }
}
