package com.volare.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ItineraryPlanDTO(
        UUID id,
        String destination,
        int durationDays,
        List<DayPlan> days,
        List<String> generalTips,
        String budgetEstimate
) {
    public record DayPlan(
            int day,
            String theme,
            List<Activity> morning,
            List<Activity> afternoon,
            List<Activity> evening
    ) {}

    public record Activity(
            String name,
            String description,
            String type,
            String estimatedDuration,
            String location,
            Double rating,
            String priceRange,
            String fsqId
    ) {}
}
