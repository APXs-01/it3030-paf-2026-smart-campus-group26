// Member 1: Facilities & Resource Management
// Features: feature/facilities-catalogue-schema, feature/resource-mgmt-endpoints, feature/facilities-inventory-ui
package com.sliit.smartcampus.backend.repository;

import com.sliit.smartcampus.backend.enums.ResourceStatus;
import com.sliit.smartcampus.backend.enums.ResourceType;
import com.sliit.smartcampus.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);
    List<Resource> findByLocationContainingIgnoreCase(String location);
}
