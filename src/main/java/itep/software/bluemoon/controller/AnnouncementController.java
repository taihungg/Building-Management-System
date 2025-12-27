package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springdoc.core.annotations.ParameterObject;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.RecipientStatusResponseDTO;
import itep.software.bluemoon.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

	private final AnnouncementService announcementService;

    // ================= STAFF APIS =================

    /**
     * Staff tạo và gửi thông báo mới 
     */
    @PostMapping("/staff/create")
    public ResponseEntity<String> createAnnouncement(@RequestBody AnnouncementCreateRequestDTO request) {
        announcementService.createAnnouncement(request);
        return ResponseEntity.ok("Thông báo đã được gửi thành công!");
    }

    /**
     * Staff xem toàn bộ danh sách thông báo đã từng gửi
     */
    @GetMapping("/staff/all")
    public ResponseEntity<Page<Announcement>> getAllAnnouncements(
    		@ParameterObject 
            @PageableDefault(
                size = 10, 
                sort = "a.createdDate", 
                direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ResponseEntity.ok(announcementService.getAllAnnouncements(pageable));
    }

    /**
     * Staff xem chi tiết danh sách người nhận và ai đã đọc thông báo đó
     */
    @GetMapping("/staff/{id}/recipients")
    public ResponseEntity<List<RecipientStatusResponseDTO>> getRecipientStatuses(@PathVariable UUID id) {
        return ResponseEntity.ok(announcementService.getRecipientStatuses(id));
    }


    // ================= RESIDENT APIS =================

    /**
     * Cư dân xem danh sách thông báo dành riêng cho mình
     */
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<Page<AnnouncementResponseDTO>> getMyAnnouncements(
            @PathVariable UUID residentId,
            @ParameterObject@PageableDefault(
                    size = 10, 
                    sort = "announcement.createdDate", 
                    direction = Sort.Direction.DESC
                ) Pageable pageable) {
        return ResponseEntity.ok(announcementService.getResidentAnnouncements(residentId, pageable));
    }

    /**
     * Cư dân đánh dấu một thông báo là đã đọc
     */
    @PatchMapping("/resident/{residentId}/read/{announcementId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID residentId,
            @PathVariable UUID announcementId) {
    	announcementService.markAsRead(residentId, announcementId);
        return ResponseEntity.noContent().build();
    }
}
