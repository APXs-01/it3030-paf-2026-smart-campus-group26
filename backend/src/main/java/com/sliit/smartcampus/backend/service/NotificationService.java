// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
package com.sliit.smartcampus.backend.service;

import com.sliit.smartcampus.backend.dto.response.NotificationResponse;
import com.sliit.smartcampus.backend.enums.NotificationType;
import com.sliit.smartcampus.backend.exception.ResourceNotFoundException;
import com.sliit.smartcampus.backend.model.Notification;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public void sendNotification(User user, String message, NotificationType type,
                                  Long relatedEntityId, String relatedEntityType) {
        // Respect user notification preferences — skip if type is disabled
        if (!userService.isNotificationEnabled(user, type)) return;

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public NotificationResponse markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .relatedEntityId(n.getRelatedEntityId())
                .relatedEntityType(n.getRelatedEntityType())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
