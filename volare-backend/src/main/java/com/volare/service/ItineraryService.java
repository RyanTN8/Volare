package com.volare.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volare.clients.FoursquareClient;
import com.volare.clients.GeminiClient;
import com.volare.domain.entity.Itinerary;
import com.volare.domain.repository.ItineraryRepository;
import com.volare.dto.ItineraryPlanDTO;
import com.volare.prompts.ItineraryPrompts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ItineraryService {

    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    private final GeminiClient geminiClient;
    private final FoursquareClient foursquareClient;
    private final ItineraryRepository itineraryRepository;
    private final ObjectMapper objectMapper;

    public ItineraryService(
            GeminiClient geminiClient,
            FoursquareClient foursquareClient,
            ItineraryRepository itineraryRepository,
            ObjectMapper objectMapper
    ) {
        this.geminiClient = geminiClient;
        this.foursquareClient = foursquareClient;
        this.itineraryRepository = itineraryRepository;
        this.objectMapper = objectMapper;
    }

    public Mono<ItineraryPlanDTO> generate(
            String destination, int durationDays, String interests, String budget,
            UUID userId, String extraContext
    ) {
        String userPrompt = ItineraryPrompts.buildUserPrompt(destination, durationDays, interests, budget, extraContext);

        return geminiClient.chatCompletion(ItineraryPrompts.SYSTEM, userPrompt)
                .flatMap(json -> parseAndValidate(json, destination, durationDays, userId))
                .flatMap(plan -> enrichWithFoursquare(plan, destination))
                .retry(1);
    }

    private Mono<ItineraryPlanDTO> parseAndValidate(String json, String destination, int durationDays, UUID userId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> planMap = objectMapper.readValue(json, Map.class);

            // Persist raw plan
            Itinerary entity = Itinerary.builder()
                    .userId(userId)
                    .destination(destination)
                    .durationDays(durationDays)
                    .generatedPlan(planMap)
                    .build();
            itineraryRepository.save(entity);

            ItineraryPlanDTO dto = objectMapper.convertValue(planMap, ItineraryPlanDTO.class);
            // Return with persisted ID
            return Mono.just(new ItineraryPlanDTO(
                    entity.getId(),
                    dto.destination(),
                    dto.durationDays(),
                    dto.days(),
                    dto.generalTips(),
                    dto.budgetEstimate()
            ));
        } catch (Exception e) {
            log.error("Failed to parse itinerary JSON: {}", e.getMessage());
            return Mono.error(new RuntimeException("AI returned invalid itinerary format, please retry"));
        }
    }

    private Mono<ItineraryPlanDTO> enrichWithFoursquare(ItineraryPlanDTO plan, String destination) {
        if (plan.days() == null || plan.days().isEmpty()) {
            return Mono.just(plan);
        }

        // Enrich RESTAURANT activities with Foursquare data for demo purposes.
        // A production implementation would batch-enrich all restaurant activities in parallel
        return foursquareClient.searchBusinesses(destination, "restaurants", null, 5000)
                .map(restaurants -> {
                    if (restaurants.isEmpty()) return plan;

                    // Attach Foursquare place IDs to RESTAURANT activities where names roughly match
                    List<ItineraryPlanDTO.DayPlan> enrichedDays = plan.days().stream()
                            .map(day -> new ItineraryPlanDTO.DayPlan(
                                    day.day(), day.theme(),
                                    enrichActivities(day.morning(), restaurants),
                                    enrichActivities(day.afternoon(), restaurants),
                                    enrichActivities(day.evening(), restaurants)
                            ))
                            .toList();

                    return new ItineraryPlanDTO(plan.id(), plan.destination(), plan.durationDays(),
                            enrichedDays, plan.generalTips(), plan.budgetEstimate());
                })
                .onErrorReturn(plan); // enrichment is best-effort
    }

    private List<ItineraryPlanDTO.Activity> enrichActivities(
            List<ItineraryPlanDTO.Activity> activities,
            List<com.volare.dto.RestaurantDTO> foursquareResults
    ) {
        if (activities == null) return List.of();
        return activities.stream().map(act -> {
            if (!"RESTAURANT".equals(act.type())) return act;
            return foursquareResults.stream()
                    .filter(r -> r.name().toLowerCase().contains(act.name().toLowerCase().substring(0, Math.min(5, act.name().length()))))
                    .findFirst()
                    .map(r -> new ItineraryPlanDTO.Activity(
                            act.name(), act.description(), act.type(), act.estimatedDuration(),
                            act.location(), r.rating(), r.priceRange(), r.id()
                    ))
                    .orElse(act);
        }).toList();
    }
}
