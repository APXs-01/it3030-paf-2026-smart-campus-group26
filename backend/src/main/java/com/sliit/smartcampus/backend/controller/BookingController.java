// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/booking-reservation-core
package com.sliit.smartcampus.backend.controller;

import com.sliit.smartcampus.backend.dto.request.BookingRequest;
import com.sliit.smartcampus.backend.dto.request.BookingReviewRequest;
import com.sliit.smartcampus.backend.dto.response.AnalyticsResponse;
import com.sliit.smartcampus.backend.dto.response.BookingResponse;
import com.sliit.smartcampus.backend.enums.BookingStatus;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import com.sliit.smartcampus.backend.service.BookingService;
import com.sliit.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> reviewBooking(@PathVariable Long id,
                                                          @Valid @RequestBody BookingReviewRequest request,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        User admin = userService.getUserById(principal.getId());
        return ResponseEntity.ok(bookingService.reviewBooking(id, request, admin));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(bookingService.getAnalytics());
    }

    @GetMapping("/verify/{checkInCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> verifyCheckIn(@PathVariable String checkInCode) {
        return ResponseEntity.ok(bookingService.verifyCheckIn(checkInCode));
    }

    @PatchMapping("/checkin/{checkInCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> performCheckIn(@PathVariable String checkInCode) {
        return ResponseEntity.ok(bookingService.performCheckIn(checkInCode));
    }
}
