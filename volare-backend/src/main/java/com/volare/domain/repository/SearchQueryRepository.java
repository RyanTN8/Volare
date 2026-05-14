package com.volare.domain.repository;

import com.volare.domain.entity.SearchQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQuery, UUID> {
    Page<SearchQuery> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);
}
