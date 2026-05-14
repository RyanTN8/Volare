package com.volare.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "search_queries", indexes = {
        @Index(name = "idx_sq_user_id", columnList = "user_id"),
        @Index(name = "idx_sq_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "origin", length = 10)
    private String origin;

    @Column(name = "destination", length = 10)
    private String destination;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "search_type", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private SearchType searchType;

    @Column(name = "query_text", length = 500)
    private String queryText;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    void onCreate() {
        timestamp = Instant.now();
    }

    public enum SearchType {
        FLIGHT, RESTAURANT, ITINERARY
    }
}
