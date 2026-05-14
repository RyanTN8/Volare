package com.volare.controller;

import com.volare.clients.GeminiClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/classify")
public class ClassifyController {

    private final GeminiClient geminiClient;

    public ClassifyController(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    @PostMapping
    public Mono<ResponseEntity<ClassifyResponse>> classify(@Valid @RequestBody ClassifyRequest req) {
        return geminiClient.classify(req.description())
                .map(tags -> ResponseEntity.ok(new ClassifyResponse(tags)));
    }

    public record ClassifyRequest(@NotBlank String description) {}
    public record ClassifyResponse(List<String> tags) {}
}
