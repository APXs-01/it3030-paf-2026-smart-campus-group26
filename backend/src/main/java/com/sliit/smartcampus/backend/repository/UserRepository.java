// Member 4: Notifications, Roles & OAuth
// Branch: feature/oauth-integration-security
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);
}
