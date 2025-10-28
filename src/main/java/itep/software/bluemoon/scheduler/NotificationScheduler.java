package itep.software.bluemoon.scheduler;

import itep.software.bluemoon.dto.request.CreateNotificationRequest;
import itep.software.bluemoon.entity.Bill;
import itep.software.bluemoon.enumeration.BillStatus;
import itep.software.bluemoon.enumeration.NotificationType;
import itep.software.bluemoon.repository.BillRepository;
import itep.software.bluemoon.repository.NotificationRepository;
import itep.software.bluemoon.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduler tự động gửi thông báo nhắc nhở
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {
    
    private final NotificationService notificationService;
    private final BillRepository billRepository;
    private final NotificationRepository notificationRepository;
    
    /**
     * Nhắc nhở thanh toán hóa đơn sắp hết hạn
     * Chạy hàng ngày lúc 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendBillReminderNotifications() {
        log.info("Running bill reminder notification job");
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate reminderDate = today.plusDays(3); // Nhắc trước 3 ngày
            
            // Tìm các hóa đơn chưa thanh toán sắp hết hạn
            List<Bill> upcomingBills = billRepository
                    .findByStatusAndExpiredDateBetween(
                            BillStatus.UNPAID, 
                            today, 
                            reminderDate);
            
            int sentCount = 0;
            for (Bill bill : upcomingBills) {
                // Kiểm tra xem đã gửi notification cho bill này chưa (tránh duplicate)
                boolean alreadySent = notificationRepository
                        .existsByRecipientIdAndReferenceIdAndReferenceType(
                                bill.getApartment().getOwner().getId(),
                                bill.getId(),
                                "BILL_REMINDER"
                        );
                
                if (alreadySent) {
                    log.debug("Reminder already sent for bill: {}", bill.getId());
                    continue;
                }
                
                CreateNotificationRequest request = CreateNotificationRequest.builder()
                        .title("Nhắc nhở thanh toán hóa đơn")
                        .message(String.format(
                                "Hóa đơn %s của bạn sẽ hết hạn vào ngày %s. " +
                                "Vui lòng thanh toán để tránh bị tính phí trễ hạn.",
                                bill.getType().name(),
                                bill.getExpiredDate()))
                        .type(NotificationType.BILL_REMINDER)
                        .recipientId(bill.getApartment().getOwner().getId())
                        .referenceId(bill.getId())
                        .referenceType("BILL_REMINDER")
                        .build();
                
                notificationService.createNotification(request);
                sentCount++;
            }
            
            log.info("Sent {} bill reminder notifications", sentCount);
        } catch (Exception e) {
            log.error("Error sending bill reminder notifications", e);
        }
    }
    
    /**
     * Thông báo hóa đơn quá hạn
     * Chạy hàng ngày lúc 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * ?")
    public void sendOverdueBillNotifications() {
        log.info("Running overdue bill notification job");
        
        try {
            LocalDate today = LocalDate.now();
            
            // Tìm các hóa đơn quá hạn
            List<Bill> overdueBills = billRepository
                    .findByStatusAndExpiredDateBefore(
                            BillStatus.UNPAID, 
                            today);
            
            int sentCount = 0;
            for (Bill bill : overdueBills) {
                // Kiểm tra xem đã gửi notification cho bill này chưa
                boolean alreadySent = notificationRepository
                        .existsByRecipientIdAndReferenceIdAndReferenceType(
                                bill.getApartment().getOwner().getId(),
                                bill.getId(),
                                "BILL_OVERDUE"
                        );
                
                if (alreadySent) {
                    log.debug("Overdue notification already sent for bill: {}", bill.getId());
                    continue;
                }
                
                CreateNotificationRequest request = CreateNotificationRequest.builder()
                        .title("Hóa đơn quá hạn")
                        .message(String.format(
                                "Hóa đơn %s của bạn đã quá hạn từ ngày %s. " +
                                "Vui lòng thanh toán ngay để tránh bị cắt dịch vụ.",
                                bill.getType().name(),
                                bill.getExpiredDate()))
                        .type(NotificationType.BILL_OVERDUE)
                        .recipientId(bill.getApartment().getOwner().getId())
                        .referenceId(bill.getId())
                        .referenceType("BILL_OVERDUE")
                        .build();
                
                notificationService.createNotification(request);
                sentCount++;
            }
            
            log.info("Sent {} overdue bill notifications", sentCount);
        } catch (Exception e) {
            log.error("Error sending overdue bill notifications", e);
        }
    }
    
    /**
     * Cleanup thông báo cũ
     * Chạy hàng tuần vào Chủ nhật lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 ? * SUN")
    public void cleanupOldNotifications() {
        log.info("Running notification cleanup job");
        
        try {
            int daysOld = 90; // Xóa thông báo cũ hơn 90 ngày
            int deletedCount = notificationService.cleanupOldNotifications(daysOld);
            
            log.info("Deleted {} old notifications", deletedCount);
        } catch (Exception e) {
            log.error("Error cleaning up old notifications", e);
        }
    }
}
