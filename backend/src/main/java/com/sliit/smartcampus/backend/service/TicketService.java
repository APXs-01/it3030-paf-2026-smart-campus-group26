// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
package com.sliit.smartcampus.backend.service;

import com.sliit.smartcampus.backend.dto.request.CommentRequest;
import com.sliit.smartcampus.backend.dto.request.TicketRequest;
import com.sliit.smartcampus.backend.dto.request.TicketUpdateRequest;
import com.sliit.smartcampus.backend.dto.response.CommentResponse;
import com.sliit.smartcampus.backend.dto.response.TicketResponse;
import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.enums.NotificationType;
import com.sliit.smartcampus.backend.enums.TicketStatus;
import com.sliit.smartcampus.backend.exception.BadRequestException;
import com.sliit.smartcampus.backend.exception.ResourceNotFoundException;
import com.sliit.smartcampus.backend.model.*;
import com.sliit.smartcampus.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final ResourceService resourceService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    public TicketResponse createTicket(TicketRequest request, List<MultipartFile> files, User user) throws IOException {
        Resource resource = request.getResourceId() != null
                ? resourceService.findById(request.getResourceId()) : null;

        Ticket ticket = Ticket.builder()
                .resource(resource)
                .location(request.getLocation())
                .reportedBy(user)
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .contactDetails(request.getContactDetails())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) throw new BadRequestException("Maximum 3 attachments allowed");
            for (MultipartFile file : files) {
                saveAttachment(saved, file);
            }
        }

        return toResponse(ticketRepository.findById(saved.getId()).orElseThrow());
    }

    public TicketResponse updateTicket(Long ticketId, TicketUpdateRequest request, User updater) {
        Ticket ticket = findById(ticketId);
        TicketStatus oldStatus = ticket.getStatus();

        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null) ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getRejectionReason() != null) ticket.setRejectionReason(request.getRejectionReason());
        User previousAssignee = ticket.getAssignedTo();
        if (request.getAssignedToUserId() != null) {
            ticket.setAssignedTo(userService.getUserById(request.getAssignedToUserId()));
        }

        Ticket saved = ticketRepository.save(ticket);

        if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
            String message = "Your ticket #" + ticket.getId() + " status has been updated to: " + request.getStatus();
            notificationService.sendNotification(ticket.getReportedBy(), message,
                    NotificationType.TICKET_STATUS_CHANGED, saved.getId(), "TICKET");
        }

        if (request.getAssignedToUserId() != null && saved.getAssignedTo() != null) {
            boolean isNewAssignment = previousAssignee == null ||
                    !previousAssignee.getId().equals(saved.getAssignedTo().getId());
            if (isNewAssignment) {
                notificationService.sendNotification(
                        saved.getAssignedTo(),
                        "Ticket #" + saved.getId() + " has been assigned to you: " + saved.getCategory() + " at " + saved.getLocation(),
                        NotificationType.TICKET_ASSIGNED,
                        saved.getId(), "TICKET"
                );
            }
        }

        return toResponse(saved);
    }

    public CommentResponse addComment(Long ticketId, CommentRequest request, User author) {
        Ticket ticket = findById(ticketId);

        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);

        if (!ticket.getReportedBy().getId().equals(author.getId())) {
            String message = "New comment on your ticket #" + ticket.getId() + " by " + author.getName();
            notificationService.sendNotification(ticket.getReportedBy(), message,
                    NotificationType.TICKET_COMMENT_ADDED, ticket.getId(), "TICKET");
        }

        return toCommentResponse(saved);
    }

    public CommentResponse updateComment(Long commentId, CommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    public List<TicketResponse> getMyTickets(User user) {
        return ticketRepository.findByReportedByOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).toList();
    }

    public List<TicketResponse> getAllTickets(TicketStatus status) {
        List<Ticket> tickets = status != null
                ? ticketRepository.findByStatus(status)
                : ticketRepository.findAllByOrderByCreatedAtDesc();
        return tickets.stream().map(this::toResponse).toList();
    }

    public TicketResponse getTicketById(Long id) {
        return toResponse(findById(id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.delete(findById(id));
    }

    private void saveAttachment(Ticket ticket, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .filePath(fileName)
                .contentType(file.getContentType())
                .build();
        attachmentRepository.save(attachment);
    }

    private Ticket findById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private TicketResponse toResponse(Ticket ticket) {
        List<String> attachmentUrls = ticket.getAttachments().stream()
                .map(a -> "/api/tickets/attachments/" + a.getFilePath())
                .toList();

        List<com.sliit.smartcampus.backend.dto.response.CommentResponse> commentResponses = ticket.getComments().stream()
                .map(this::toCommentResponse)
                .toList();

        return TicketResponse.builder()
                .id(ticket.getId())
                .resource(ticket.getResource() != null ? resourceService.toResponse(ticket.getResource()) : null)
                .location(ticket.getLocation())
                .reportedBy(buildUserResponse(ticket.getReportedBy()))
                .assignedTo(ticket.getAssignedTo() != null ? buildUserResponse(ticket.getAssignedTo()) : null)
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachmentUrls(attachmentUrls)
                .comments(commentResponses)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .author(buildUserResponse(comment.getAuthor()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
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

