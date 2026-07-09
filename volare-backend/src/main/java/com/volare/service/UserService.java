package com.volare.service;

import com.volare.domain.entity.SavedItem;
import com.volare.domain.entity.User;
import com.volare.domain.repository.SavedItemRepository;
import com.volare.domain.repository.UserRepository;
import com.volare.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SavedItemRepository savedItemRepository;

    public UserService(UserRepository userRepository, SavedItemRepository savedItemRepository) {
        this.userRepository = userRepository;
        this.savedItemRepository = savedItemRepository;
    }

    @Transactional
    public User upsertPreferences(String email, String displayName, Map<String, Object> preferences) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (displayName != null) user.setDisplayName(displayName);
                    if (preferences != null) user.setPreferences(preferences);
                    return userRepository.save(user);
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .displayName(displayName)
                                .preferences(preferences)
                                .build()
                ));
    }

    public User getPreferences(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }

    @Transactional
    public SavedItem saveItem(UUID userId, String externalId, SavedItem.ItemType type, Map<String, Object> payload) {
        if (savedItemRepository.existsByUserIdAndExternalId(userId, externalId)) {
            throw new IllegalStateException("Item already saved");
        }
        return savedItemRepository.save(SavedItem.builder()
                .userId(userId)
                .externalId(externalId)
                .itemType(type)
                .payload(payload)
                .build());
    }

    public List<SavedItem> getSavedItems(UUID userId) {
        return savedItemRepository.findByUserIdOrderBySavedAtDesc(userId);
    }

    @Transactional
    public void removeSavedItem(UUID userId, String externalId) {
        savedItemRepository.deleteByUserIdAndExternalId(userId, externalId);
    }
}
