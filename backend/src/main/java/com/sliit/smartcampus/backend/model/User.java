// Member 4: Notifications, Roles & OAuth
// Branch: feature/role-based-access-control
package com.sliit.smartcampus.backend.model;

import com.sliit.smartcampus.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    private String picture;

    /** Null for OAuth-only accounts; BCrypt-hashed for local accounts. */
    private String password;

    private String phone;

    @Column(length = 300)
    private String address;

    @Column(length = 500)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String provider;
    private String providerId;

    // Comma-separated list of DISABLED NotificationType names
    // null / empty = all enabled
    @Column(length = 500)
    private String disabledNotificationTypes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
