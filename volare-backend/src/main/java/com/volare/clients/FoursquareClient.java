package com.volare.clients;

import com.volare.config.CacheConfig;
import com.volare.dto.RestaurantDTO;
import com.volare.dto.foursquare.FoursquarePlacesResponse;
import com.volare.exception.NotFoundException;
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
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Component
public class FoursquareClient {

    private static final Logger log = LoggerFactory.getLogger(FoursquareClient.class);

    // Foursquare category id for "Dining and Drinking"
    private static final String RESTAURANT_CATEGORY = "13065";
    private static final String PLACE_FIELDS =
            "fsq_id,name,categories,closed_bucket,distance,geocodes,hours,location,photos,popularity,price,rating,tel,website";

    private final WebClient webClient;

    public FoursquareClient(
            WebClient.Builder webClientBuilder,
            @Value("${foursquare.base-url}") String baseUrl,
            @Value("${foursquare.api-key}") String apiKey
    ) {
        // Foursquare Places API v3 expects the raw API key in the Authorization header (no "Bearer" prefix).
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, apiKey)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @CircuitBreaker(name = "foursquare", fallbackMethod = "searchFallback")
    @Retry(name = "foursquare")
    @Cacheable(value = CacheConfig.FOURSQUARE_SEARCH_CACHE,
               key = "#location + '-' + #term + '-' + #priceTier + '-' + #radius")
    public Mono<List<RestaurantDTO>> searchBusinesses(String location, String term, String priceTier, int radius) {
        UriComponentsBuilder uri = UriComponentsBuilder.fromPath("/places/search")
                .queryParam("near", location)
                .queryParam("radius", radius)
                .queryParam("categories", RESTAURANT_CATEGORY)
                .queryParam("limit", 20)
                .queryParam("fields", PLACE_FIELDS);

        if (term != null && !term.isBlank()) {
            uri.queryParam("query", term);
        }
        parsePriceTier(priceTier).ifPresent(p -> {
            uri.queryParam("min_price", p);
            uri.queryParam("max_price", p);
        });

        return webClient.get()
                .uri(uri.build().toUriString())
                .retrieve()
                .bodyToMono(FoursquarePlacesResponse.class)
                .map(resp -> resp.results() == null
                        ? List.<RestaurantDTO>of()
                        : resp.results().stream().map(this::mapToDTO).toList())
                .doOnError(e -> log.error("Foursquare search error: {}", e.getMessage()));
    }

    @CircuitBreaker(name = "foursquare", fallbackMethod = "detailFallback")
    @Retry(name = "foursquare")
    @Cacheable(value = CacheConfig.FOURSQUARE_DETAIL_CACHE, key = "#placeId")
    public Mono<RestaurantDTO> getBusinessDetail(String placeId) {
        return webClient.get()
                .uri(builder -> builder.path("/places/{id}")
                        .queryParam("fields", PLACE_FIELDS)
                        .build(placeId))
                .retrieve()
                .bodyToMono(FoursquarePlacesResponse.Place.class)
                .map(this::mapToDTO)
                .doOnError(e -> log.error("Foursquare detail error: {}", e.getMessage()));
    }

    private RestaurantDTO mapToDTO(FoursquarePlacesResponse.Place p) {
        return RestaurantDTO.builder()
                .id(p.fsqId())
                .name(p.name())
                .imageUrl(firstPhotoUrl(p.photos()))
                .url(p.website())
                // Foursquare ratings are on a 0-10 scale; normalize to the 0-5 scale the UI expects.
                .rating(p.rating() != null ? p.rating() / 2.0 : 0.0)
                // Foursquare's Places API does not expose a review count.
                .reviewCount(0)
                .priceRange(priceLabel(p.price()))
                .categories(p.categories() != null
                        ? p.categories().stream().map(FoursquarePlacesResponse.Category::name).toList()
                        : List.of())
                .location(mapLocation(p))
                .phone(p.tel())
                .isClosed(p.closedBucket() != null && p.closedBucket().contains("Closed"))
                .distanceMeters(p.distance() != null ? p.distance() : 0.0)
                .build();
    }

    private RestaurantDTO.Location mapLocation(FoursquarePlacesResponse.Place p) {
        FoursquarePlacesResponse.Location loc = p.location();
        FoursquarePlacesResponse.Main geo = p.geocodes() != null ? p.geocodes().main() : null;
        if (loc == null && geo == null) {
            return null;
        }
        return new RestaurantDTO.Location(
                loc != null ? loc.address() : null,
                loc != null ? loc.locality() : null,
                loc != null ? loc.region() : null,
                loc != null ? loc.country() : null,
                geo != null ? geo.latitude() : 0.0,
                geo != null ? geo.longitude() : 0.0
        );
    }

    private String firstPhotoUrl(List<FoursquarePlacesResponse.Photo> photos) {
        if (photos == null || photos.isEmpty()) {
            return null;
        }
        FoursquarePlacesResponse.Photo photo = photos.get(0);
        return photo.prefix() + "original" + photo.suffix();
    }

    private String priceLabel(Integer price) {
        if (price == null || price < 1 || price > 4) {
            return null;
        }
        return "$".repeat(price);
    }

    private Optional<Integer> parsePriceTier(String priceTier) {
        if (priceTier == null || priceTier.isBlank()) {
            return Optional.empty();
        }
        try {
            int tier = Integer.parseInt(priceTier.trim());
            return (tier >= 1 && tier <= 4) ? Optional.of(tier) : Optional.empty();
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    @SuppressWarnings("unused")
    public Mono<List<RestaurantDTO>> searchFallback(
            String location, String term, String priceTier, int radius, Throwable t) {
        log.warn("Foursquare circuit breaker open for search: {}", t.getMessage());
        return Mono.just(List.of());
    }

    @SuppressWarnings("unused")
    public Mono<RestaurantDTO> detailFallback(String placeId, Throwable t) {
        log.warn("Foursquare circuit breaker open for detail: {}", t.getMessage());
        return Mono.error(new NotFoundException("Restaurant details are temporarily unavailable"));
    }
}
