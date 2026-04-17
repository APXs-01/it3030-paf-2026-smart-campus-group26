// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-reservation-core
package com.sliit.smartcampus.backend.dto.response;

import com.sliit.smartcampus.backend.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private ResourceResponse resource;
    private UserResponse user;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer attendeeCount;
    private BookingStatus status;
    private String rejectionReason;
    private String checkInCode;
    private boolean checkedIn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
