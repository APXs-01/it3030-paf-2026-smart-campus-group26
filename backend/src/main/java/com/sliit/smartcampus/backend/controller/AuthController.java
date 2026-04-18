// Member 4: Notifications, Roles & OAuth
// Branch: feature/oauth-integration-security
package com.sliit.smartcampus.backend.controller;

import com.sliit.smartcampus.backend.dto.request.LoginRequest;
import com.sliit.smartcampus.backend.dto.request.RegisterRequest;
import com.sliit.smartcampus.backend.dto.request.SendOtpRequest;
import com.sliit.smartcampus.backend.dto.response.AuthResponse;
import com.sliit.smartcampus.backend.dto.response.UserResponse;
import com.sliit.smartcampus.backend.enums.UserRole;
import com.sliit.smartcampus.backend.exception.BadRequestException;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.repository.UserRepository;
import com.sliit.smartcampus.backend.security.JwtTokenProvider;
import com.sliit.smartcampus.backend.security.UserPrincipal;
import com.sliit.smartcampus.backend.service.EmailService;
import com.sliit.smartcampus.backend.service.OtpService;
import com.sliit.smartcampus.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    @Value("${app.admin.email}")
    private String adminEmail;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(userService.toResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (user.getPassword() == null) {
            throw new BadRequestException("This account uses Google sign-in. Please use the Continue with Google option.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(UserPrincipal.create(user));
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestBody SendOtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        String otp = otpService.generate(request.getEmail());
        emailService.sendOtp(request.getEmail(), otp);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        if (!otpService.verify(request.getEmail(), request.getOtp())) {
            throw new BadRequestException("Invalid or expired verification code");
        }

        UserRole role = request.getEmail().equalsIgnoreCase(adminEmail) ? UserRole.ADMIN : UserRole.USER;

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .provider("local")
                .build();

        User saved = userRepository.save(user);

        String token = tokenProvider.generateToken(UserPrincipal.create(saved));
        return ResponseEntity.ok(new AuthResponse(token));
    }
}

