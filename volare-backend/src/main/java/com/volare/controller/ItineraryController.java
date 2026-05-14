package com.volare.controller;

import com.volare.dto.ItineraryPlanDTO;
import com.volare.service.ItineraryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/itinerary")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping("/generate")
    public Mono<ResponseEntity<ItineraryPlanDTO>> generate(@Valid @RequestBody GenerateRequest req) {
        return itineraryService.generate(
                        req.destination(), req.durationDays(), req.interests(),
                        req.budget(), req.userId(), req.extraContext()
                )
                .map(ResponseEntity::ok);
    }

    public record GenerateRequest(
            @NotBlank String destination,
            @Min(1) @Max(30) int durationDays,
            @NotBlank String interests,
            @NotBlank String budget,
            UUID userId,
            String extraContext
    ) {}
}
