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
import reactor.core.scheduler.Schedulers;

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

        // Kick off Foursquare in parallel with Gemini — the destination is known now.
        Mono<List<com.volare.dto.RestaurantDTO>> restaurantsMono =
                foursquareClient.searchBusinesses(destination, "restaurants", null, 5000)
                        .onErrorReturn(List.of())
                        .cache(); // share the result between the zip subscribers

        Mono<String> geminiMono = geminiClient.chatCompletion(ItineraryPrompts.SYSTEM, userPrompt);

        return Mono.zip(geminiMono, restaurantsMono)
                .flatMap(tuple -> parseAndValidate(tuple.getT1(), destination, durationDays, userId)
                        .map(plan -> enrichWithRestaurants(plan, tuple.getT2())))
                .retry(1);
    }

    private Mono<ItineraryPlanDTO> parseAndValidate(String json, String destination, int durationDays, UUID userId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> planMap = objectMapper.readValue(json, Map.class);

            ItineraryPlanDTO dto = objectMapper.convertValue(planMap, ItineraryPlanDTO.class);

            // JPA save is blocking JDBC — must run off the reactor event loop.
            return Mono.fromCallable(() -> {
                        Itinerary entity = Itinerary.builder()
                                .userId(userId)
                                .destination(destination)
                                .durationDays(durationDays)
                                .generatedPlan(planMap)
                                .build();
                        return itineraryRepository.save(entity);
                    })
                    .subscribeOn(Schedulers.boundedElastic())
                    .map(entity -> new ItineraryPlanDTO(
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

    private ItineraryPlanDTO enrichWithRestaurants(
            ItineraryPlanDTO plan,
            List<com.volare.dto.RestaurantDTO> restaurants
    ) {
        if (restaurants.isEmpty() || plan.days() == null || plan.days().isEmpty()) {
            return plan;
        }

        List<Map.Entry<String, com.volare.dto.RestaurantDTO>> normalized = restaurants.stream()
                .map(r -> Map.entry(r.name().toLowerCase(), r))
                .toList();

        List<ItineraryPlanDTO.DayPlan> enrichedDays = plan.days().stream()
                .map(day -> new ItineraryPlanDTO.DayPlan(
                        day.day(), day.theme(),
                        enrichActivities(day.morning(), normalized),
                        enrichActivities(day.afternoon(), normalized),
                        enrichActivities(day.evening(), normalized)
                ))
                .toList();

        return new ItineraryPlanDTO(plan.id(), plan.destination(), plan.durationDays(),
                enrichedDays, plan.generalTips(), plan.budgetEstimate());
    }

    private List<ItineraryPlanDTO.Activity> enrichActivities(
            List<ItineraryPlanDTO.Activity> activities,
            List<Map.Entry<String, com.volare.dto.RestaurantDTO>> normalizedRestaurants
    ) {
        if (activities == null) return List.of();
        return activities.stream().map(act -> {
            if (!"RESTAURANT".equals(act.type())) return act;
            String prefix = act.name().toLowerCase().substring(0, Math.min(5, act.name().length()));
            return normalizedRestaurants.stream()
                    .filter(e -> e.getKey().contains(prefix))
                    .map(Map.Entry::getValue)
                    .findFirst()
                    .map(r -> new ItineraryPlanDTO.Activity(
                            act.name(), act.description(), act.type(), act.estimatedDuration(),
                            act.location(), r.rating(), r.priceRange(), r.id()
                    ))
                    .orElse(act);
        }).toList();
    }
}
