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
    public static final String DUFFEL_FLIGHT_CACHE = "duffelFlights";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                FOURSQUARE_SEARCH_CACHE,
                FOURSQUARE_DETAIL_CACHE,
                DUFFEL_FLIGHT_CACHE
        );
        manager.setCaffeine(defaultSpec());
        // Required: the cached client methods return Mono<...>, which Spring caches
        // via Caffeine's AsyncCache. Without async mode every @Cacheable call 409s.
        manager.setAsyncCacheMode(true);
        return manager;
    }

    private Caffeine<Object, Object> defaultSpec() {
        return Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(500)
                .recordStats();
    }
}
