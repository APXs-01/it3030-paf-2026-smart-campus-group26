// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
package com.sliit.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Content is required")
    private String content;
}
