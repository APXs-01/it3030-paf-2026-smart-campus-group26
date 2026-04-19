// Shared: Seeds initial campus resources on first startup
package com.sliit.smartcampus.backend.config;

import com.sliit.smartcampus.backend.enums.ResourceStatus;
import com.sliit.smartcampus.backend.enums.ResourceType;
import com.sliit.smartcampus.backend.model.Resource;
import com.sliit.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) {
        if (resourceRepository.count() > 0) return;

        List<Resource> resources = List.of(
            // Lecture Halls
            Resource.builder().name("Lecture Hall A").type(ResourceType.LECTURE_HALL)
                .capacity(120).location("Block A - Ground Floor")
                .description("Large lecture hall with projector, whiteboard and audio system.")
                .availabilityWindows("Mon-Fri 08:00-20:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Lecture Hall B").type(ResourceType.LECTURE_HALL)
                .capacity(80).location("Block B - Level 1")
                .description("Medium lecture hall with smart board and air conditioning.")
                .availabilityWindows("Mon-Fri 08:00-20:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Lecture Hall C").type(ResourceType.LECTURE_HALL)
                .capacity(200).location("Block C - Ground Floor")
                .description("Main auditorium-style hall for large seminars and events.")
                .availabilityWindows("Mon-Sat 08:00-22:00")
                .status(ResourceStatus.ACTIVE).build(),

            // Labs
            Resource.builder().name("Computer Lab 01").type(ResourceType.LAB)
                .capacity(40).location("Block D - Level 2")
                .description("40 workstations with Windows 11, VS Code, IntelliJ and Java 21.")
                .availabilityWindows("Mon-Fri 08:00-18:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Computer Lab 02").type(ResourceType.LAB)
                .capacity(40).location("Block D - Level 3")
                .description("40 workstations for networking and cybersecurity practicals.")
                .availabilityWindows("Mon-Fri 08:00-18:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Electronics Lab").type(ResourceType.LAB)
                .capacity(25).location("Block E - Level 1")
                .description("Electronics and embedded systems lab with oscilloscopes and Arduino kits.")
                .availabilityWindows("Mon-Fri 09:00-17:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Physics Lab").type(ResourceType.LAB)
                .capacity(30).location("Block E - Level 2")
                .description("Physics experiments lab. Booking requires supervisor approval.")
                .availabilityWindows("Mon-Fri 09:00-16:00")
                .status(ResourceStatus.OUT_OF_SERVICE).build(),

            // Meeting Rooms
            Resource.builder().name("Board Room").type(ResourceType.MEETING_ROOM)
                .capacity(12).location("Admin Block - Level 3")
                .description("Executive meeting room with video conferencing and whiteboard.")
                .availabilityWindows("Mon-Fri 08:00-18:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Meeting Room 01").type(ResourceType.MEETING_ROOM)
                .capacity(8).location("Block A - Level 1")
                .description("Small meeting room with TV screen and HDMI connectivity.")
                .availabilityWindows("Mon-Fri 08:00-20:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Meeting Room 02").type(ResourceType.MEETING_ROOM)
                .capacity(6).location("Block B - Level 2")
                .description("Quiet collaboration room ideal for group study sessions.")
                .availabilityWindows("Mon-Sat 08:00-20:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Innovation Hub").type(ResourceType.MEETING_ROOM)
                .capacity(20).location("Block F - Ground Floor")
                .description("Open collaboration space with movable furniture, TVs and whiteboards.")
                .availabilityWindows("Mon-Sat 08:00-22:00")
                .status(ResourceStatus.ACTIVE).build(),

            // Equipment
            Resource.builder().name("Projector (Portable)").type(ResourceType.EQUIPMENT)
                .capacity(1).location("IT Store - Block A")
                .description("Full HD portable projector with HDMI/USB-C. Collect from IT store.")
                .availabilityWindows("Mon-Fri 08:00-17:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("Video Camera Kit").type(ResourceType.EQUIPMENT)
                .capacity(1).location("Media Lab - Block F")
                .description("Sony HD camera with tripod, microphone and lighting set.")
                .availabilityWindows("Mon-Fri 09:00-17:00")
                .status(ResourceStatus.ACTIVE).build(),

            Resource.builder().name("3D Printer").type(ResourceType.EQUIPMENT)
                .capacity(1).location("Innovation Lab - Block F")
                .description("Creality Ender 3D printer. Filament provided. Training required.")
                .availabilityWindows("Mon-Fri 09:00-16:00")
                .status(ResourceStatus.ACTIVE).build()
        );

        resourceRepository.saveAll(resources);
        log.info("Seeded {} campus resources.", resources.size());
    }
}
