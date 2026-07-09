package com.volare.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    public static final String FOURSQUARE_SEARCH_CACHE = "foursquareSearch";
    public static final String FOURSQUARE_DETAIL_CACHE = "foursquareDetail";
    public static final String DUFFEL_FLIGHT_CACHE     = "duffelFlights";
    public static final String ITINERARY_GENERATION_CACHE = "itineraryGeneration";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        // Required: cached client methods return Mono<>, which Spring handles via
        // Caffeine's AsyncCache. Without async mode every @Cacheable call 409s.
        manager.setAsyncCacheMode(true);

        // Per-cache TTLs — flight results are stable for hours; restaurant data changes
        // more often; LLM responses for identical prompts are deterministic enough to
        // cache for a full day.
        manager.registerCustomCache(FOURSQUARE_SEARCH_CACHE,
                Caffeine.newBuilder().expireAfterWrite(30, TimeUnit.MINUTES).maximumSize(300).recordStats().buildAsync());
        manager.registerCustomCache(FOURSQUARE_DETAIL_CACHE,
                Caffeine.newBuilder().expireAfterWrite(60, TimeUnit.MINUTES).maximumSize(500).recordStats().buildAsync());
        manager.registerCustomCache(DUFFEL_FLIGHT_CACHE,
                Caffeine.newBuilder().expireAfterWrite(2, TimeUnit.HOURS).maximumSize(200).recordStats().buildAsync());
        manager.registerCustomCache(ITINERARY_GENERATION_CACHE,
                Caffeine.newBuilder().expireAfterWrite(24, TimeUnit.HOURS).maximumSize(100).recordStats().buildAsync());

        return manager;
    }
}
