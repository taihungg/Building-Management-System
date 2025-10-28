package itep.software.bluemoon.service;

import itep.software.bluemoon.dto.NotificationDTO;
import itep.software.bluemoon.dto.request.CreateNotificationRequest;
import itep.software.bluemoon.dto.request.NotificationFilterRequest;
import itep.software.bluemoon.entity.Apartment;
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

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

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
     * Lấy danh sách thông báo mới nhất
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getLatestNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(notificationMapper::toDTO);
    }

    /**
     * Lấy danh sách thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUnreadNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
        return notifications.map(notificationMapper::toDTO);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public long countUnreadNotifications(UUID userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    /**
     * Lấy danh sách thông báo với bộ lọc
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(
            UUID recipientId,
            NotificationFilterRequest filter) {

        // Validate sortBy against allowed fields to avoid runtime exception
        List<String> allowedSortFields = Arrays.asList("createdAt", "readAt", "title", "type");
        String sortBy = allowedSortFields.contains(filter.getSortBy()) ? filter.getSortBy() : "createdAt";

        Sort sort = filter.getSortDirection().equalsIgnoreCase("ASC") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Convert LocalDate to LocalDateTime
        LocalDateTime fromDateTime = filter.getFromDate() != null ?
                filter.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = filter.getToDate() != null ?
                filter.getToDate().atTime(LocalTime.MAX) : null;

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
     * Tạo thông báo mới
     */
    @Transactional
    public List<NotificationDTO> createNotification(CreateNotificationRequest request) {
        log.info("Creating notification: {}", request.getTitle());
        
        List<Resident> recipients = determineRecipients(request);
        
        if (recipients.isEmpty()) {
            log.warn("No recipients found for notification: {}", request.getTitle());
            return Collections.emptyList();
        }
        
        List<NotificationDTO> result = new ArrayList<>();
        
        for (Resident recipient : recipients) {
            try {
                Notification notification = Notification.builder()
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(request.getType())
                        .recipient(recipient)
                        .referenceId(request.getReferenceId())
                        .referenceType(request.getReferenceType())
                        .isRead(false)
                        .build();
                
                notification = notificationRepository.save(notification);
                
                // Gửi push notification qua WebSocket
                pushNotificationService.sendPushNotification(notification);
                
                result.add(notificationMapper.toDTO(notification));
                
                log.debug("Created notification for user: {}", recipient.getId());
            } catch (Exception e) {
                log.error("Failed to create notification for user: {}", recipient.getId(), e);
            }
        }
        
        log.info("Created {} notifications", result.size());
        return result;
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    @Transactional
    public boolean markAsRead(UUID notificationId, UUID userId) {
        try {
            int updated = notificationRepository.markAsRead(
                    notificationId, 
                    userId, 
                    LocalDateTime.now()
            );
            
            if (updated > 0) {
                log.info("Marked notification {} as read for user {}", notificationId, userId);
                return true;
            }
            
            log.warn("Notification {} not found or not owned by user {}", notificationId, userId);
            return false;
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return false;
        }
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public int markAllAsRead(UUID userId) {
        try {
            int count = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
            log.info("Marked {} notifications as read for user {}", count, userId);
            return count;
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return 0;
        }
    }

    /**
     * Xóa thông báo
     */
    @Transactional
    public boolean deleteNotification(UUID notificationId, UUID userId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isEmpty()) {
                log.warn("Notification {} not found", notificationId);
                return false;
            }
            
            Notification notification = notificationOpt.get();
            
            // Kiểm tra xem notification có thuộc về user này không
            if (!notification.getRecipient().getId().equals(userId)) {
                log.warn("User {} attempted to delete notification {} owned by another user", 
                        userId, notificationId);
                return false;
            }
            
            notificationRepository.delete(notification);
            log.info("Deleted notification {} for user {}", notificationId, userId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return false;
        }
    }

    /**
     * Cleanup thông báo cũ
     */
    @Transactional
    public int cleanupOldNotifications(int daysOld) {
        try {
            LocalDateTime beforeDate = LocalDateTime.now().minusDays(daysOld);
            int deleted = notificationRepository.deleteOldNotifications(beforeDate);
            log.info("Deleted {} old notifications (older than {} days)", deleted, daysOld);
            return deleted;
        } catch (Exception e) {
            log.error("Error cleaning up old notifications", e);
            return 0;
        }
    }

    /**
     * Xác định danh sách recipients dựa trên request
     * Loại trùng lặp (dedupe) theo resident id
     */
    private List<Resident> determineRecipients(CreateNotificationRequest request) {
        Map<UUID, Resident> recipientsById = new LinkedHashMap<>();

        // Trường hợp 1: Gửi đến một người cụ thể
        if (request.getRecipientId() != null) {
            residentRepository.findById(request.getRecipientId())
                    .ifPresent(r -> recipientsById.put(r.getId(), r));
        }

        // Trường hợp 2: Gửi đến nhiều người cụ thể
        if (request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()) {
            List<Resident> found = residentRepository.findAllById(request.getRecipientIds());
            for (Resident r : found) {
                if (r != null && r.getId() != null) {
                    recipientsById.put(r.getId(), r);
                }
            }
        }

        // Trường hợp 3: Gửi đến tất cả residents của một building
        if (request.getBuildingId() != null) {
            buildingRepository.findById(request.getBuildingId())
                    .ifPresent(building -> {
                        if (building.getApartments() != null) {
                            for (Apartment apartment : building.getApartments()) {
                                if (apartment.getResidents() != null) {
                                    for (Resident r : apartment.getResidents()) {
                                        if (r != null && r.getId() != null) {
                                            recipientsById.put(r.getId(), r);
                                        }
                                    }
                                }
                            }
                        }
                    });
        }

        // Trường hợp 4: Gửi đến tất cả residents của một apartment
        if (request.getApartmentId() != null) {
            apartmentRepository.findById(request.getApartmentId())
                    .ifPresent(apartment -> {
                        if (apartment.getResidents() != null) {
                            for (Resident r : apartment.getResidents()) {
                                if (r != null && r.getId() != null) {
                                    recipientsById.put(r.getId(), r);
                                }
                            }
                        }
                    });
        }

        return new ArrayList<>(recipientsById.values());
    }
}
