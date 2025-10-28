package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Notification;
import itep.software.bluemoon.enumeration.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    // Lấy thông báo theo recipient ID với phân trang
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(
            UUID recipientId, 
            Pageable pageable
    );
    
    // Lấy thông báo chưa đọc của một user
    Page<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(
            UUID recipientId, 
            boolean isRead,
            Pageable pageable
    );
    
    // Đếm số thông báo chưa đọc
    long countByRecipientIdAndIsRead(UUID recipientId, boolean isRead);
    
    // Tìm kiếm có bộ lọc phức tạp
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId " +
           "AND (:types IS NULL OR n.type IN :types) " +
           "AND (:isRead IS NULL OR n.isRead = :isRead) " +
           "AND (:fromDate IS NULL OR n.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR n.createdAt <= :toDate)")
    Page<Notification> findByFilters(
            @Param("recipientId") UUID recipientId,
            @Param("types") List<NotificationType> types,
            @Param("isRead") Boolean isRead,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
    
    // Đánh dấu đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
           "WHERE n.id = :notificationId AND n.recipient.id = :recipientId")
    int markAsRead(
            @Param("notificationId") UUID notificationId,
            @Param("recipientId") UUID recipientId,
            @Param("readAt") LocalDateTime readAt
    );
    
    // Đánh dấu tất cả đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
           "WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsRead(
            @Param("recipientId") UUID recipientId,
            @Param("readAt") LocalDateTime readAt
    );
    
    // Xóa thông báo cũ)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    int deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);
    
    // Lấy thông báo theo reference
    List<Notification> findByReferenceIdAndReferenceType(
            UUID referenceId, 
            String referenceType
    );
}