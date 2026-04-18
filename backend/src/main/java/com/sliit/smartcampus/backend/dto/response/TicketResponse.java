// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
package com.sliit.smartcampus.backend.dto.response;

import com.sliit.smartcampus.backend.enums.TicketCategory;
import com.sliit.smartcampus.backend.enums.TicketPriority;
import com.sliit.smartcampus.backend.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private ResourceResponse resource;
    private String location;
    private UserResponse reportedBy;
    private UserResponse assignedTo;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> attachmentUrls;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
