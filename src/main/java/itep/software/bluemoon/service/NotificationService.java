package itep.software.bluemoon.service;

import itep.software.bluemoon.dto.NotificationDTO;
import itep.software.bluemoon.dto.request.CreateNotificationRequest;
import itep.software.bluemoon.dto.request.NotificationFilterRequest;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.Notification;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.mapper.NotificationMapper;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.BuildingRepository;
import itep.software.bluemoon.repository.NotificationRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final ResidentRepository residentRepository;
    private final BuildingRepository buildingRepository;
    private final ApartmentRepository apartmentRepository;
    private final NotificationMapper notificationMapper;
    private final PushNotificationService pushNotificationService;
    
    /**
     * Lấy danh sách thông báo với bộ lọc
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(
            UUID recipientId, 
            NotificationFilterRequest filter) {
        
        // Tạo Pageable với sắp xếp
        Sort sort = filter.getSortDirection().equalsIgnoreCase("ASC") ?
                Sort.by(filter.getSortBy()).ascending() :
                Sort.by(filter.getSortBy()).descending();
        
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);
        
        // Chuyển đổi LocalDate sang LocalDateTime
        LocalDateTime fromDateTime = filter.getFromDate() != null ?
                filter.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = filter.getToDate() != null ?
                filter.getToDate().atTime(LocalTime.MAX) : null;
        
        // Truy vấn với bộ lọc
        Page<Notification> notifications = notificationRepository.findByFilters(
                recipientId,
                filter.getTypes(),
                filter.getIsRead(),
                fromDateTime,
                toDateTime,
                pageable
        );
        
        return notifications.map(notificationMapper::toDTO);
    }
    
    /**
     * Lấy thông báo mới nhất (không lọc)
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getLatestNotifications(
            UUID recipientId, 
            int page, 
            int size) {
        
        Pageable pageable = PageRequest.of(page, size, 
                Sort.by("createdAt").descending());
        
        Page<Notification> notifications = 
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                        recipientId, pageable);
        
        return notifications.map(notificationMapper::toDTO);
    }
    
    /**
     * Lấy thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUnreadNotifications(
            UUID recipientId, 
            int page, 
            int size) {
        
        Pageable pageable = PageRequest.of(page, size, 
                Sort.by("createdAt").descending());
        
        Page<Notification> notifications = 
                notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(
                        recipientId, false, pageable);
        
        return notifications.map(notificationMapper::toDTO);
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public long countUnreadNotifications(UUID recipientId) {
        return notificationRepository.countByRecipientIdAndIsRead(recipientId, false);
    }
    
    /**
     * Tạo thông báo mới (hỗ trợ nhiều recipient)
     */
    @Transactional
    public List<NotificationDTO> createNotification(CreateNotificationRequest request) {
        List<Resident> recipients = determineRecipients(request);
        
        if (recipients.isEmpty()) {
            log.warn("No recipients found for notification: {}", request.getTitle());
            return new ArrayList<>();
        }
        
        List<Notification> notifications = new ArrayList<>();
        
        for (Resident recipient : recipients) {
            Notification notification = Notification.builder()
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(request.getType())
                    .recipient(recipient)
                    .referenceId(request.getReferenceId())
                    .referenceType(request.getReferenceType())
                    .isRead(false)
                    .build();
            
            notifications.add(notification);
        }
        
        // Lưu tất cả thông báo
        List<Notification> savedNotifications = 
                notificationRepository.saveAll(notifications);
        
        // Gửi push notification
        for (Notification notification : savedNotifications) {
            pushNotificationService.sendPushNotification(notification);
        }
        
        log.info("Created {} notifications for: {}", 
                savedNotifications.size(), request.getTitle());
        
        return savedNotifications.stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Xác định danh sách recipients dựa trên request
     */
    private List<Resident> determineRecipients(CreateNotificationRequest request) {
        List<Resident> recipients = new ArrayList<>();
        
        // Trường hợp 1: Gửi đến một người cụ thể
        if (request.getRecipientId() != null) {
            residentRepository.findById(request.getRecipientId())
                    .ifPresent(recipients::add);
        }
        
        // Trường hợp 2: Gửi đến nhiều người cụ thể
        if (request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()) {
            recipients.addAll(residentRepository.findAllById(request.getRecipientIds()));
        }
        
        // Trường hợp 3: Gửi đến tất cả residents của một building
        if (request.getBuildingId() != null) {
            buildingRepository.findById(request.getBuildingId())
                    .ifPresent(building -> {
                        for (Apartment apartment : building.getApartments()) {
                            if (apartment.getResidents() != null) {
                                recipients.addAll(apartment.getResidents());
                            }
                        }
                    });
        }
        
        // Trường hợp 4: Gửi đến tất cả residents của một apartment
        if (request.getApartmentId() != null) {
            apartmentRepository.findById(request.getApartmentId())
                    .ifPresent(apartment -> {
                        if (apartment.getResidents() != null) {
                            recipients.addAll(apartment.getResidents());
                        }
                    });
        }
        
        return recipients;
    }
    
    /**
     * Đánh dấu thông báo đã đọc
     */
    @Transactional
    public boolean markAsRead(UUID notificationId, UUID recipientId) {
        int updated = notificationRepository.markAsRead(
                notificationId, recipientId, LocalDateTime.now());
        return updated > 0;
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public int markAllAsRead(UUID recipientId) {
        return notificationRepository.markAllAsRead(
                recipientId, LocalDateTime.now());
    }
    
    /**
     * Xóa thông báo
     */
    @Transactional
    public boolean deleteNotification(UUID notificationId, UUID recipientId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getRecipient().getId().equals(recipientId))
                .map(n -> {
                    notificationRepository.delete(n);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Cleanup - Xóa thông báo cũ (chạy theo schedule)
     */
    @Transactional
    public int cleanupOldNotifications(int daysOld) {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(daysOld);
        return notificationRepository.deleteOldNotifications(beforeDate);
    }
}