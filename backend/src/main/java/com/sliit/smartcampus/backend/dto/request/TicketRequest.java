// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
package com.sliit.smartcampus.backend.dto.request;

import com.sliit.smartcampus.backend.enums.TicketCategory;
import com.sliit.smartcampus.backend.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {
    private Long resourceId;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String contactDetails;
}
