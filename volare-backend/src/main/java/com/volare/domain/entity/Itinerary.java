package com.volare.domain.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "itineraries", indexes = {
        @Index(name = "idx_itin_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "destination", nullable = false, length = 255)
    private String destination;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Type(JsonBinaryType.class)
    @Column(name = "generated_plan", columnDefinition = "jsonb")
    private Map<String, Object> generatedPlan;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
