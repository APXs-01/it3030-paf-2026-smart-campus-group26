// Member 3: Incident Tickets & Technician Updates
// Branch: feature/incident-ticketing-system
package com.sliit.smartcampus.backend.controller;

import com.sliit.smartcampus.backend.dto.request.CommentRequest;
import com.sliit.smartcampus.backend.dto.request.TicketRequest;
import com.sliit.smartcampus.backend.dto.request.TicketUpdateRequest;
import com.sliit.smartcampus.backend.dto.response.CommentResponse;
import com.sliit.smartcampus.backend.dto.response.TicketResponse;
import com.sliit.smartcampus.backend.enums.TicketStatus;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import com.sliit.smartcampus.backend.service.TicketService;
import com.sliit.smartcampus.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @RequestPart("ticket") @Valid TicketRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, files, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ticketService.getMyTickets(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {
        return ResponseEntity.ok(ticketService.getAllTickets(status));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
                                                        @RequestBody TicketUpdateRequest request,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        User updater = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ticketService.updateTicket(id, request, updater));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long ticketId,
                                                       @Valid @RequestBody CommentRequest request,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(ticketId, request, user));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long commentId,
                                                          @Valid @RequestBody CommentRequest request,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ticketService.updateComment(commentId, request, user));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        ticketService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String fileName) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists()) {
            return ResponseEntity.ok().body(resource);
        }
        return ResponseEntity.notFound().build();
    }
}
