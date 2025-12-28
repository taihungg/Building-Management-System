package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.projection.AnnouncementDetailSummary;
import itep.software.bluemoon.model.projection.AnnouncementWithReadStatus;
import itep.software.bluemoon.model.projection.RecipientStatusSummary;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.AnnouncementService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    
    // Tạo thông báo mới
    @PostMapping
    public ResponseEntity<Object> createAnnouncement(
            @RequestBody AnnouncementCreateRequestDTO request) {
        
        Announcement announcement = announcementService.createAnnouncement(request);
        
        return ApiResponse.responseBuilder(
                HttpStatus.CREATED,
                "Announcement created successfully",
                announcement
        );
    }

    // Staff xem tất cả announcements
    @GetMapping("/staff")
    public ResponseEntity<Object> getAllAnnouncements() {
        List<AnnouncementDetailSummary> announcements = announcementService.getAllAnnouncements();
        return ApiResponse.responseBuilder(HttpStatus.OK, "Success", announcements);
    }

    // Staff xem recipient statuses của một announcement
    @GetMapping("/{announcementId}/recipients")
    public ResponseEntity<Object> getRecipientStatuses(
            @PathVariable UUID announcementId) {
        
        List<RecipientStatusSummary> statuses = 
                announcementService.getRecipientStatuses(announcementId);
        
        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Recipient statuses retrieved successfully",
                statuses
        );
    }

    // Resident xem announcements của mình
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<Object> getResidentAnnouncements(@PathVariable UUID residentId) {
        List<AnnouncementWithReadStatus> announcements = 
            announcementService.getResidentAnnouncements(residentId);
        return ApiResponse.responseBuilder(HttpStatus.OK, "Success", announcements);
    }
    

    // Đánh dấu announcement đã đọc
    @PatchMapping("/resident/{residentId}/announcement/{announcementId}/read")
    public ResponseEntity<Object> markAsRead(
            @PathVariable UUID residentId,
            @PathVariable UUID announcementId) {
        
        announcementService.markAsRead(residentId, announcementId);
        
        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Announcement marked as read",
                null
        );
    }
}