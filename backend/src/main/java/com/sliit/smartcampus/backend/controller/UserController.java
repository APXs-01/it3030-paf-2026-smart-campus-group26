// Member 4: Notifications, Roles & OAuth
// Branch: feature/role-based-access-control
package com.sliit.smartcampus.backend.controller;

import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.enums.UserRole;
import com.sliit.smartcampus.backend.exception.BadRequestException;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import com.sliit.smartcampus.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toResponse(userService.getUserById(id)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Prevent admin from downgrading their own account
        if (principal.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }
        UserRole role = UserRole.valueOf(body.get("role"));
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(userService.updateProfile(
                user,
                body.get("name"),
                body.get("phone"),
                body.get("address"),
                body.get("bio")
        ));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        String ext = contentType.substring(contentType.indexOf('/') + 1).replaceAll("[^a-zA-Z0-9]", "");
        String filename = "avatar_" + principal.getId() + "_" + UUID.randomUUID() + "." + ext;

        Path dir = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename),
                java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        String url = "/uploads/avatars/" + filename;
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(userService.updateAvatar(user, url));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        userService.deleteAccount(user);
        return ResponseEntity.noContent().build();
    }
}
