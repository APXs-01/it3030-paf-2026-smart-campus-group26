// Member 4: Notifications, Roles & OAuth
// Branch: feature/notification-service-alerts
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.model.Notification;
import com.sliit.smartcampus.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalse(User user);
    long countByUserAndIsReadFalse(User user);
    void deleteByUser(User user);
}
