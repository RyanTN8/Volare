package com.volare.clients;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.volare.config.CacheConfig;
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

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final WebClient webClient;
    private final String model;
    private final ObjectMapper objectMapper;

    public GeminiClient(
            WebClient.Builder webClientBuilder,
            @Value("${gemini.base-url}") String baseUrl,
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model}") String model,
            ObjectMapper objectMapper
    ) {
        this.model = model;
        this.objectMapper = objectMapper;
        // Gemini authenticates via the x-goog-api-key header.
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("x-goog-api-key", apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @CircuitBreaker(name = "gemini", fallbackMethod = "completionFallback")
    @Retry(name = "gemini")
    @Cacheable(value = CacheConfig.ITINERARY_GENERATION_CACHE, key = "#systemPrompt + '|' + #userMessage")
    public Mono<String> chatCompletion(String systemPrompt, String userMessage) {
        Map<String, Object> body = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", userMessage))
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 4096,
                        "responseMimeType", "application/json"
                )
        );

        return webClient.post()
                .uri("/models/{model}:generateContent", model)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(GenerateContentResponse.class)
                .map(this::extractText)
                .doOnError(e -> log.error("Gemini completion error: {}", e.getMessage()));
    }

    @CircuitBreaker(name = "gemini", fallbackMethod = "classifyFallback")
    @Retry(name = "gemini")
    public Mono<List<String>> classify(String description) {
        String system = """
                You are a travel and dining classification engine.
                Return ONLY valid JSON in this exact format: {"tags": ["tag1", "tag2", ...]}
                Choose from: romantic, family-friendly, adventure, budget, luxury, business,
                outdoor, indoor, cultural, nightlife, brunch, healthy, vegetarian, vegan,
                seafood, international, local, trendy, historic, beachside, mountainous.
                Select the 3-5 most relevant tags.""";

        return chatCompletion(system, description)
                .map(json -> {
                    try {
                        var node = objectMapper.readTree(json);
                        return objectMapper.convertValue(node.get("tags"),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                    } catch (Exception e) {
                        log.warn("Failed to parse classification response: {}", json);
                        return List.<String>of();
                    }
                });
    }

    private String extractText(GenerateContentResponse response) {
        if (response.candidates() == null || response.candidates().isEmpty()) {
            throw new IllegalStateException("Gemini returned no candidates");
        }
        GenerateContentResponse.Content content = response.candidates().get(0).content();
        if (content == null || content.parts() == null || content.parts().isEmpty()) {
            throw new IllegalStateException("Gemini returned an empty response");
        }
        return content.parts().get(0).text();
    }

    @SuppressWarnings("unused")
    public Mono<String> completionFallback(String system, String user, Throwable t) {
        log.warn("Gemini circuit breaker open: {}", t.getMessage());
        return Mono.error(new RuntimeException("AI service temporarily unavailable"));
    }

    @SuppressWarnings("unused")
    public Mono<List<String>> classifyFallback(String description, Throwable t) {
        log.warn("Gemini classify circuit breaker open: {}", t.getMessage());
        return Mono.just(List.of());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GenerateContentResponse(List<Candidate> candidates) {

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Candidate(Content content, String finishReason) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Content(List<Part> parts, String role) {}

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Part(String text) {}
    }
}
