// Member 4: Notifications, Roles & OAuth
// Branch: feature/oauth-integration-security
package com.sliit.smartcampus.backend.security;

import com.sliit.smartcampus.backend.enums.UserRole;
import com.sliit.smartcampus.backend.model.User;
import com.sliit.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerId = (String) attributes.get("sub");

        String rawEmail = (String) attributes.get("email");

        if (rawEmail == null) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("email_not_found"), "Email not provided by OAuth2 provider");
        }

        String rawName = (String) attributes.get("name");
        if (rawName == null) {
            rawName = rawEmail.contains("@") ? rawEmail.substring(0, rawEmail.indexOf('@')) : rawEmail;
        }

        // Effectively final copies for use inside the lambda
        final String email = rawEmail;
        final String name = rawName;
        final String picture = (String) attributes.get("picture");

        UserRole role = email.equalsIgnoreCase(adminEmail) ? UserRole.ADMIN : UserRole.USER;

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .picture(picture)
                        .role(role)
                        .provider(provider)
                        .providerId(providerId)
                        .build())
        );

        // Promote to admin if not already
        if (email.equalsIgnoreCase(adminEmail) && user.getRole() != UserRole.ADMIN) {
            user.setRole(UserRole.ADMIN);
            userRepository.save(user);
        }

        // Sync name/picture if changed (name is guaranteed non-null at this point)
        if (!name.equals(user.getName())) {
            user.setName(name);
            user.setPicture(picture);
            userRepository.save(user);
        }

        return UserPrincipal.create(user, attributes);
    }
}
