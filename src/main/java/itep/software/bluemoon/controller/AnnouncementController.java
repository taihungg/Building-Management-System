package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.RecipientResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO;
import itep.software.bluemoon.service.AnnouncementService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // Staff tạo thông báo
    @PostMapping
    public AnnouncementResponseDTO createAnnouncement(
            @RequestBody AnnouncementCreateRequestDTO request) {
        return announcementService.createAnnouncement(request);
    }
    
    // Staff xem danh sách thông báo
    @GetMapping
    public List<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementService.getAllAnnouncementsSummary();
    }

    // Staff xem chi tiết danh sách người nhận thông báo
    @GetMapping("/{id}/recipients")
    public ResponseEntity<List<RecipientResponseDTO>> getAnnouncementRecipients(
            @PathVariable("id") UUID announcementId) {
        return ResponseEntity.ok(announcementService.getRecipientsByAnnouncement(announcementId));
    }
    
    // Resident xem danh sách tbao
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<List<ResidentAnnouncementResponseDTO>> getResidentAnnouncements(
            @PathVariable UUID residentId) {
        List<ResidentAnnouncementResponseDTO> announcements = 
            announcementService.getAnnouncementsForResident(residentId);
        return ResponseEntity.ok(announcements);
    }
}