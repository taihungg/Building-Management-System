package itep.software.bluemoon.controller;

import itep.software.bluemoon.dto.NotificationDTO;
import itep.software.bluemoon.dto.request.CreateNotificationRequest;
import itep.software.bluemoon.dto.request.NotificationFilterRequest;
import itep.software.bluemoon.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Lấy danh sách thông báo mới nhất
     * GET /api/notifications/latest?page=0&size=20
     */
    @GetMapping("/latest")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Page<NotificationDTO>> getLatestNotifications(
            @AuthenticationPrincipal UUID userId, // Assume có authentication
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<NotificationDTO> notifications = 
                notificationService.getLatestNotifications(userId, page, size);
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Lấy danh sách thông báo chưa đọc
     * GET /api/notifications/unread?page=0&size=20
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Page<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<NotificationDTO> notifications = 
                notificationService.getUnreadNotifications(userId, page, size);
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Lấy số lượng thông báo chưa đọc
     * GET /api/notifications/unread/count
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UUID userId) {
        
        long count = notificationService.countUnreadNotifications(userId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy danh sách thông báo với bộ lọc
     * POST /api/notifications/filter
     * Body: NotificationFilterRequest
     */
    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Page<NotificationDTO>> getNotificationsWithFilter(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody NotificationFilterRequest filter) {
        
        Page<NotificationDTO> notifications = 
                notificationService.getNotifications(userId, filter);
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Tạo thông báo mới (chỉ admin/manager)
     * POST /api/notifications
     * Body: CreateNotificationRequest
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<NotificationDTO>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        
        List<NotificationDTO> notifications = 
                notificationService.createNotification(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(notifications);
    }
    
    /**
     * Đánh dấu thông báo đã đọc
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        
        boolean success = notificationService.markAsRead(id, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? 
                "Notification marked as read" : 
                "Failed to mark notification as read");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal UUID userId) {
        
        int count = notificationService.markAllAsRead(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", count);
        response.put("message", count + " notifications marked as read");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Xóa thông báo
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        
        boolean success = notificationService.deleteNotification(id, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? 
                "Notification deleted successfully" : 
                "Failed to delete notification");
        
        return success ? 
                ResponseEntity.ok(response) : 
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}