// Member 3: Incident Tickets & Technician Updates
// Branch: feature/technician-workflow-updates
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.model.Comment;
import com.sliit.smartcampus.backend.model.Ticket;
import com.sliit.smartcampus.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketOrderByCreatedAtAsc(Ticket ticket);

    /** Delete all comments written by this user (on any ticket) */
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.author = :user")
    void deleteByAuthor(@Param("user") User user);
}
