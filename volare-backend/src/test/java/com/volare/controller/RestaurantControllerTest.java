package com.volare.controller;

import com.volare.dto.RestaurantDTO;
import com.volare.service.RestaurantService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RestaurantController.class)
class RestaurantControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RestaurantService restaurantService;

    // RequestLoggingFilter is picked up by the web slice and needs a MeterRegistry,
    // which metrics auto-configuration does not provide inside @WebMvcTest.
    @TestConfiguration
    static class MetricsTestConfig {
        @Bean
        MeterRegistry meterRegistry() {
            return new SimpleMeterRegistry();
        }
    }

    @Test
    @WithMockUser
    void search_returnsResults() throws Exception {
        RestaurantDTO dto = RestaurantDTO.builder()
                .id("id1")
                .name("Tartine")
                .rating(4.8)
                .reviewCount(2000)
                .priceRange("$$")
                .categories(List.of("Bakery"))
                .build();

        when(restaurantService.search(any(), any(), any(), anyInt()))
                .thenReturn(Mono.just(List.of(dto)));

        // The controller returns Mono<ResponseEntity<...>>, so MockMvc must dispatch the async result.
        MvcResult result = mockMvc.perform(get("/api/restaurants/search")
                        .param("location", "San Francisco")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(request().asyncStarted())
                .andReturn();

        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Tartine"))
                .andExpect(jsonPath("$[0].rating").value(4.8));
    }

    @Test
    @WithMockUser
    void search_missingLocation_returns400() throws Exception {
        mockMvc.perform(get("/api/restaurants/search")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
