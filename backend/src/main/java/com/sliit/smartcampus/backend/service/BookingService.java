// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/conflict-validation-logic
package com.sliit.smartcampus.backend.service;

import com.sliit.smartcampus.backend.dto.request.BookingRequest;
import com.sliit.smartcampus.backend.dto.request.BookingReviewRequest;
import com.sliit.smartcampus.backend.dto.response.AnalyticsResponse;
import com.sliit.smartcampus.backend.dto.response.BookingResponse;
import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.enums.BookingStatus;
import com.sliit.smartcampus.backend.enums.NotificationType;
import com.sliit.smartcampus.backend.exception.BadRequestException;
import com.sliit.smartcampus.backend.exception.ConflictException;
import com.sliit.smartcampus.backend.exception.ResourceNotFoundException;
import com.sliit.smartcampus.backend.model.Booking;
import com.sliit.smartcampus.backend.model.Resource;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    public BookingResponse createBooking(BookingRequest request, User user) {
        Resource resource = resourceService.findById(request.getResourceId());

        if (request.getStartTime().isAfter(request.getEndTime()) ||
                request.getStartTime().equals(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource, request.getBookingDate(), request.getStartTime(), request.getEndTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED));
        if (!conflicts.isEmpty()) {
            throw new ConflictException("The resource is already booked for the selected time slot");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendeeCount(request.getAttendeeCount())
                .status(BookingStatus.PENDING)
                .checkInCode(UUID.randomUUID().toString())
                .checkedIn(false)
                .build();

        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse reviewBooking(Long bookingId, BookingReviewRequest request, User admin) {
        Booking booking = findById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be reviewed");
        }

        booking.setStatus(request.getApproved() ? BookingStatus.APPROVED : BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason());
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        NotificationType type = request.getApproved() ? NotificationType.BOOKING_APPROVED : NotificationType.BOOKING_REJECTED;
        String message = request.getApproved()
                ? "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been approved."
                : "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been rejected. Reason: " + request.getReason();

        notificationService.sendNotification(booking.getUser(), message, type, saved.getId(), "BOOKING");

        return toResponse(saved);
    }

    public BookingResponse cancelBooking(Long bookingId, User user) {
        Booking booking = findById(bookingId);

        boolean isOwner = booking.getUser().getId().equals(user.getId());
        if (!isOwner) {
            throw new BadRequestException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                saved.getUser(),
                "Your booking for " + saved.getResource().getName() + " on " + saved.getBookingDate() + " has been cancelled.",
                NotificationType.BOOKING_CANCELLED,
                saved.getId(), "BOOKING"
        );

        return toResponse(saved);
    }

    public List<BookingResponse> getMyBookings(User user) {
        return bookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).toList();
    }

    public List<BookingResponse> getAllBookings(BookingStatus status) {
        List<Booking> bookings = status != null
                ? bookingRepository.findByStatus(status)
                : bookingRepository.findAllByOrderByCreatedAtDesc();
        return bookings.stream().map(this::toResponse).toList();
    }

    public BookingResponse getBookingById(Long id) {
        return toResponse(findById(id));
    }

    public BookingResponse verifyCheckIn(String checkInCode) {
        Booking booking = bookingRepository.findByCheckInCode(checkInCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid check-in code"));
        return toResponse(booking);
    }

    public BookingResponse performCheckIn(String checkInCode) {
        Booking booking = bookingRepository.findByCheckInCode(checkInCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid check-in code"));
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED bookings can be checked in");
        }
        if (booking.isCheckedIn()) {
            throw new BadRequestException("Booking already checked in");
        }
        booking.setCheckedIn(true);
        return toResponse(bookingRepository.save(booking));
    }

    public AnalyticsResponse getAnalytics() {
        List<Booking> all = bookingRepository.findAll();

        // Status counts
        Map<BookingStatus, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));

        // Top 5 resources by booking count
        List<AnalyticsResponse.ResourceStat> topResources = all.stream()
                .collect(Collectors.groupingBy(Booking::getResource, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<com.sliit.smartcampus.backend.model.Resource, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> AnalyticsResponse.ResourceStat.builder()
                        .resourceId(e.getKey().getId())
                        .resourceName(e.getKey().getName())
                        .location(e.getKey().getLocation())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Peak hours (hour of startTime → count), sorted by hour
        List<AnalyticsResponse.HourStat> peakHours = all.stream()
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.HourStat.builder()
                        .hour(e.getKey())
                        .label(String.format("%02d:00", e.getKey()))
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Bookings per day for last 7 days
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("EEE dd MMM");
        List<AnalyticsResponse.DayStat> last7Days = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = all.stream()
                    .filter(b -> b.getBookingDate().equals(day))
                    .count();
            last7Days.add(AnalyticsResponse.DayStat.builder()
                    .date(day.format(fmt))
                    .count(count)
                    .build());
        }

        long checkedInCount = all.stream().filter(Booking::isCheckedIn).count();

        return AnalyticsResponse.builder()
                .totalBookings(all.size())
                .approved(byStatus.getOrDefault(BookingStatus.APPROVED, 0L))
                .pending(byStatus.getOrDefault(BookingStatus.PENDING, 0L))
                .rejected(byStatus.getOrDefault(BookingStatus.REJECTED, 0L))
                .cancelled(byStatus.getOrDefault(BookingStatus.CANCELLED, 0L))
                .checkedIn(checkedInCount)
                .topResources(topResources)
                .peakHours(peakHours)
                .last7Days(last7Days)
                .build();
    }

    private Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resource(resourceService.toResponse(booking.getResource()))
                .user(buildUserResponse(booking.getUser()))
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendeeCount(booking.getAttendeeCount())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .checkInCode(booking.getCheckInCode())
                .checkedIn(booking.isCheckedIn())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private UserResponse buildUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .picture(user.getPicture())
                .role(user.getRole())
                .build();
    }
}
