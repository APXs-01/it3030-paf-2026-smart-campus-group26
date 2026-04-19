// Member 3: Incident Tickets & Technician Updates
// Branch: feature/ticket-attachments-handling
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.model.Ticket;
import com.sliit.smartcampus.backend.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicket(Ticket ticket);
    long countByTicket(Ticket ticket);
}
