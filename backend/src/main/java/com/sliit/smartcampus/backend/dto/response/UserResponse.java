// Member 4: Notifications, Roles & OAuth
// Branch: feature/role-based-access-control
package com.sliit.smartcampus.backend.dto.response;

import com.sliit.smartcampus.backend.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String picture;
    private UserRole role;
    private String provider;
    private String phone;
    private String address;
    private String bio;
    private String disabledNotificationTypes;
    private LocalDateTime createdAt;
}
