// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
package com.sliit.smartcampus.backend.dto.response;

import com.sliit.smartcampus.backend.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private Long relatedEntityId;
    private String relatedEntityType;
    private LocalDateTime createdAt;
}
