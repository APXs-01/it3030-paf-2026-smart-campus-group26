// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
package com.sliit.smartcampus.backend.controller;

import com.sliit.smartcampus.backend.dto.response.NotificationResponse;
import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import com.sliit.smartcampus.backend.service.NotificationService;
import com.sliit.smartcampus.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(notificationService.markAsRead(id, user));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/notifications/preferences — returns the user's disabled notification types */
    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Set<String>>> getPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(Map.of("disabled", userService.getDisabledTypes(user)));
    }

    /** PUT /api/notifications/preferences — saves the set of disabled notification types */
    @PutMapping("/preferences")
    public ResponseEntity<UserResponse> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Set<String>> body) {
        User user = userService.getUserById(principal.getId());
        Set<String> disabled = body.getOrDefault("disabled", Set.of());
        return ResponseEntity.ok(userService.updateNotificationPreferences(user, disabled));
    }
}
