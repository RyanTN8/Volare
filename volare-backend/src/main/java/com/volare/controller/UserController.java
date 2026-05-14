package com.volare.controller;

import com.volare.domain.entity.SavedItem;
import com.volare.domain.entity.User;
import com.volare.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/preferences")
    public ResponseEntity<User> upsertPreferences(@Valid @RequestBody PreferencesRequest req) {
        User user = userService.upsertPreferences(req.email(), req.displayName(), req.preferences());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}/preferences")
    public ResponseEntity<User> getPreferences(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getPreferences(id));
    }

    @PostMapping("/saved-items")
    public ResponseEntity<SavedItem> saveItem(@Valid @RequestBody SaveItemRequest req) {
        SavedItem item = userService.saveItem(req.userId(), req.externalId(), req.type(), req.payload());
        return ResponseEntity.ok(item);
    }

    @GetMapping("/{id}/saved-items")
    public ResponseEntity<List<SavedItem>> getSavedItems(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getSavedItems(id));
    }

    @DeleteMapping("/{id}/saved-items/{externalId}")
    public ResponseEntity<Void> removeSavedItem(@PathVariable UUID id, @PathVariable String externalId) {
        userService.removeSavedItem(id, externalId);
        return ResponseEntity.noContent().build();
    }

    public record PreferencesRequest(
            @Email @NotBlank String email,
            String displayName,
            Map<String, Object> preferences
    ) {}

    public record SaveItemRequest(
            @NotNull UUID userId,
            @NotBlank String externalId,
            @NotNull SavedItem.ItemType type,
            Map<String, Object> payload
    ) {}
}
