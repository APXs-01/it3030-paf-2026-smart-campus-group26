// Member 1: Facilities & Resource Management
// Features: feature/facilities-catalogue-schema, feature/resource-mgmt-endpoints, feature/facilities-inventory-ui
// Member 1: Facilities & Resource Management
// Branch: feature/resource-mgmt-endpoints
package com.sliit.smartcampus.backend.dto.response;

import com.sliit.smartcampus.backend.enums.ResourceStatus;
import com.sliit.smartcampus.backend.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResourceResponse {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status;
    private java.util.List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
