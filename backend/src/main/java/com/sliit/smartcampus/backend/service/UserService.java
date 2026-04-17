package com.sliit.smartcampus.backend.service;

import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.enums.NotificationType;
import com.sliit.smartcampus.backend.enums.UserRole;
import com.sliit.smartcampus.backend.exception.ResourceNotFoundException;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.repository.BookingRepository;
import com.sliit.smartcampus.backend.repository.NotificationRepository;
import com.sliit.smartcampus.backend.repository.UserRepository;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final com.sliit.smartcampus.backend.repository.TicketRepository ticketRepository;
    private final com.sliit.smartcampus.backend.repository.CommentRepository commentRepository;

    public UserPrincipal loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserPrincipal.create(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .picture(user.getPicture())
                .role(user.getRole())
                .provider(user.getProvider())
                .phone(user.getPhone())
                .address(user.getAddress())
                .bio(user.getBio())
                .disabledNotificationTypes(user.getDisabledNotificationTypes())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse updateRole(Long id, UserRole newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return toResponse(userRepository.save(user));
    }

    public UserResponse updateProfile(User user, String name, String phone, String address, String bio) {
        if (name    != null && !name.isBlank())    user.setName(name.trim());
        if (phone   != null)                       user.setPhone(phone.isBlank() ? null : phone.trim());
        if (address != null)                       user.setAddress(address.isBlank() ? null : address.trim());
        if (bio     != null)                       user.setBio(bio.isBlank() ? null : bio.trim());
        return toResponse(userRepository.save(user));
    }

    public UserResponse updateAvatar(User user, String pictureUrl) {
        user.setPicture(pictureUrl);
        return toResponse(userRepository.save(user));
    }

    /** Returns the set of disabled notification type names for a user. */
    public Set<String> getDisabledTypes(User user) {
        String val = user.getDisabledNotificationTypes();
        if (val == null || val.isBlank()) return Set.of();
        return Arrays.stream(val.split(",")).map(String::trim).collect(Collectors.toSet());
    }

    /** Returns true if the user wants to receive this notification type. */
    public boolean isNotificationEnabled(User user, NotificationType type) {
        return !getDisabledTypes(user).contains(type.name());
    }

    /** Saves the set of DISABLED types for the user. */
    public UserResponse updateNotificationPreferences(User user, Set<String> disabledTypes) {
        user.setDisabledNotificationTypes(String.join(",", disabledTypes));
        return toResponse(userRepository.save(user));
    }

    /** Permanently deletes the user account, respecting all FK constraints. */
    @Transactional
    public void deleteAccount(User user) {
        // 1. Unassign from tickets where this user is a technician (nullable → set null)
        ticketRepository.clearAssignedTo(user);

        // 2. Clear reviewer on bookings this user reviewed (nullable → set null)
        bookingRepository.clearReviewedBy(user);

        // 3. Delete tickets this user reported — cascade ALL deletes their comments & attachments
        ticketRepository.deleteByReportedBy(user);

        // 4. Delete any remaining comments this user made on OTHER users' tickets
        commentRepository.deleteByAuthor(user);

        // 5. Delete all notifications for this user
        notificationRepository.deleteByUser(user);

        // 6. Delete all bookings made by this user
        bookingRepository.deleteByUser(user);

        // 7. Finally delete the user record
        userRepository.delete(user);
    }
}
