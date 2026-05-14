package com.volare.controller;

import com.volare.dto.FlightOfferDTO;
import com.volare.service.FlightService;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@Validated
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<List<FlightOfferDTO>>> search(
            @RequestParam @NotBlank @Size(min = 3, max = 3) String origin,
            @RequestParam @NotBlank @Size(min = 3, max = 3) String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate,
            @RequestParam(defaultValue = "1") @Min(1) @Max(9) int passengers
    ) {
        return flightService.searchFlights(
                        origin, destination,
                        departureDate.toString(),
                        returnDate != null ? returnDate.toString() : null,
                        passengers
                )
                .map(ResponseEntity::ok);
    }
}
