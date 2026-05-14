package com.volare.service;

import com.volare.clients.FoursquareClient;
import com.volare.dto.RestaurantDTO;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class RestaurantService {

    private final FoursquareClient foursquareClient;

    public RestaurantService(FoursquareClient foursquareClient) {
        this.foursquareClient = foursquareClient;
    }

    public Mono<List<RestaurantDTO>> search(String location, String term, String priceTier, int radius) {
        return foursquareClient.searchBusinesses(location, term, priceTier, radius);
    }

    public Mono<RestaurantDTO> getDetail(String businessId) {
        return foursquareClient.getBusinessDetail(businessId);
    }
}
