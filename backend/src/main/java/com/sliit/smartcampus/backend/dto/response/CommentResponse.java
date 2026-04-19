// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
package com.sliit.smartcampus.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private Long ticketId;
    private UserResponse author;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
