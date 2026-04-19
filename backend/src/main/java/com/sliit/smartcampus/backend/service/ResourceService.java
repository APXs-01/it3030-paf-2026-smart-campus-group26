// Member 1: Facilities & Resource Management
// Features: feature/facilities-catalogue-schema, feature/resource-mgmt-endpoints, feature/facilities-inventory-ui
package com.sliit.smartcampus.backend.service;

import com.sliit.smartcampus.backend.dto.request.ResourceRequest;
import com.sliit.smartcampus.backend.dto.response.ResourceResponse;
import com.sliit.smartcampus.backend.enums.ResourceStatus;
import com.sliit.smartcampus.backend.enums.ResourceType;
import com.sliit.smartcampus.backend.exception.ResourceNotFoundException;
import com.sliit.smartcampus.backend.model.Resource;
import com.sliit.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    public List<ResourceResponse> getAllResources(ResourceType type, ResourceStatus status, String location) {
        List<Resource> resources;
        if (type != null && status != null) {
            resources = resourceRepository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            resources = resourceRepository.findByType(type);
        } else if (status != null) {
            resources = resourceRepository.findByStatus(status);
        } else if (location != null && !location.isBlank()) {
            resources = resourceRepository.findByLocationContainingIgnoreCase(location);
        } else {
            resources = resourceRepository.findAll();
        }
        return resources.stream().map(this::toResponse).toList();
    }

    public ResourceResponse getResourceById(Long id) {
        return toResponse(findById(id));
    }

    public ResourceResponse createResource(ResourceRequest request, List<MultipartFile> images) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus())
                .imageUrls(saveImages(images))
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    public ResourceResponse updateResource(Long id, ResourceRequest request, List<MultipartFile> images) {
        Resource resource = findById(id);
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setStatus(request.getStatus());
        String saved = saveImages(images);
        if (saved != null) resource.setImageUrls(saved);
        return toResponse(resourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        resourceRepository.delete(findById(id));
    }

    public Resource findById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    private String saveImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) return null;
        List<String> urls = new ArrayList<>();
        Path dir = Paths.get(uploadDir, "resources");
        try {
            Files.createDirectories(dir);
            for (MultipartFile file : images.stream().limit(3).toList()) {
                if (file.isEmpty()) continue;
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), dir.resolve(filename));
                urls.add("/uploads/resources/" + filename);
            }
        } catch (IOException e) {
            log.error("Failed to save resource images", e);
        }
        return urls.isEmpty() ? null : String.join(",", urls);
    }

    public ResourceResponse toResponse(Resource resource) {
        List<String> imageList = null;
        if (resource.getImageUrls() != null && !resource.getImageUrls().isBlank()) {
            imageList = Arrays.asList(resource.getImageUrls().split(","));
        }
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .availabilityWindows(resource.getAvailabilityWindows())
                .status(resource.getStatus())
                .imageUrls(imageList)
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
