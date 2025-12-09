package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementResponseDTO createAnnouncement(
            @RequestBody AnnouncementCreateRequestDTO request) {
        return announcementService.createAnnouncement(request);
    }
    
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }
}