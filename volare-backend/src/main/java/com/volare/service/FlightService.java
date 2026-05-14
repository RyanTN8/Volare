package com.volare.service;

import com.volare.clients.DuffelClient;
import com.volare.dto.FlightOfferDTO;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class FlightService {

    private final DuffelClient duffelClient;

    public FlightService(DuffelClient duffelClient) {
        this.duffelClient = duffelClient;
    }

    public Mono<List<FlightOfferDTO>> searchFlights(
            String origin, String destination,
            String departureDate, String returnDate, int passengers
    ) {
        return duffelClient.searchFlights(origin, destination, departureDate, returnDate, passengers);
    }
}
