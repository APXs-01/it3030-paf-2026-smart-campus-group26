// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.enums.TicketPriority;
import com.sliit.smartcampus.backend.enums.TicketStatus;
import com.sliit.smartcampus.backend.model.Ticket;
import com.sliit.smartcampus.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedBy(User user);
    List<Ticket> findByAssignedTo(User user);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByReportedByOrderByCreatedAtDesc(User user);

    /** Unassign this user from any tickets they are assigned to */
    @Modifying
    @Query("UPDATE Ticket t SET t.assignedTo = null WHERE t.assignedTo = :user")
    void clearAssignedTo(@Param("user") User user);

    /** Delete all tickets reported by this user */
    void deleteByReportedBy(User user);
}
