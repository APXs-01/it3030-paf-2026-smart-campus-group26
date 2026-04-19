package com.sliit.smartcampus.backend.dto.request;

import com.sliit.smartcampus.backend.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateRequest {
    private TicketStatus status;
    private String resolutionNotes;
    private String rejectionReason;
    private Long assignedToUserId;
} 
