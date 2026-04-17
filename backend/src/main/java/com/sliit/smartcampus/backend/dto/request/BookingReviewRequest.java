// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-reservation-core
package com.sliit.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingReviewRequest {
    @NotNull(message = "Approved flag is required")
    private Boolean approved;
    private String reason;
}
