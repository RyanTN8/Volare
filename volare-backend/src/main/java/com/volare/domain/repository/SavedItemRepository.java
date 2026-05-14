package com.volare.domain.repository;

import com.volare.domain.entity.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedItemRepository extends JpaRepository<SavedItem, UUID> {
    List<SavedItem> findByUserIdOrderBySavedAtDesc(UUID userId);
    List<SavedItem> findByUserIdAndItemTypeOrderBySavedAtDesc(UUID userId, SavedItem.ItemType itemType);
    boolean existsByUserIdAndExternalId(UUID userId, String externalId);
    void deleteByUserIdAndExternalId(UUID userId, String externalId);
}
