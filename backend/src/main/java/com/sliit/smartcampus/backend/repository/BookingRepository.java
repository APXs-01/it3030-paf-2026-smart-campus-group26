// Member 2: Booking Workflow & Conflict Checking
// Branch: feature/conflict-validation-logic
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.enums.BookingStatus;
import com.sliit.smartcampus.backend.model.Booking;
import com.sliit.smartcampus.backend.model.Resource;
import com.sliit.smartcampus.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByUserOrderByCreatedAtDesc(User user);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResource(Resource resource);

    @Query("SELECT b FROM Booking b WHERE b.resource = :resource AND b.bookingDate = :date " +
           "AND b.status IN :statuses " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findConflictingBookings(
            @Param("resource") Resource resource,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses);

    List<Booking> findAllByOrderByCreatedAtDesc();

    java.util.Optional<Booking> findByCheckInCode(String checkInCode);

    void deleteByUser(User user);

    /** Clear reviewer reference when the reviewer account is deleted */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Booking b SET b.reviewedBy = null WHERE b.reviewedBy = :user")
    void clearReviewedBy(@org.springframework.data.repository.query.Param("user") User user);
}
