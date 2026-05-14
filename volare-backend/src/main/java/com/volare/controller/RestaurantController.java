package com.volare.controller;

import com.volare.dto.RestaurantDTO;
import com.volare.service.RestaurantService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@Validated
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<List<RestaurantDTO>>> search(
            @RequestParam @NotBlank String location,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String priceTier,
            @RequestParam(defaultValue = "5000") @Min(100) @Max(40000) int radius
    ) {
        return restaurantService.search(location, term, priceTier, radius)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<RestaurantDTO>> detail(@PathVariable String id) {
        return restaurantService.getDetail(id)
                .map(ResponseEntity::ok);
    }
}
