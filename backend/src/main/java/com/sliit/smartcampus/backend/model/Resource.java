// Member 1: Facilities & Resource Management
// Features: feature/facilities-catalogue-schema, feature/resource-mgmt-endpoints, feature/facilities-inventory-ui
package com.sliit.smartcampus.backend.model;

import com.sliit.smartcampus.backend.enums.ResourceStatus;
import com.sliit.smartcampus.backend.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    private Integer capacity;

    @Column(nullable = false)
    private String location;

    private String description;

    private String availabilityWindows;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    // Comma-separated image file paths (up to 3)
    @Column(length = 1000)
    private String imageUrls;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
