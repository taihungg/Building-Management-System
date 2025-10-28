package itep.software.bluemoon.service;

import itep.software.bluemoon.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service xử lý push notification qua WebSocket
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Gửi push notification đến một user cụ thể qua WebSocket
     */
    public void sendPushNotification(Notification notification) {
        try {
            String destination = "/topic/notifications/" + 
                    notification.getRecipient().getId();
            
            Map<String, Object> message = new HashMap<>();
            message.put("id", notification.getId());
            message.put("title", notification.getTitle());
            message.put("message", notification.getMessage());
            message.put("type", notification.getType());
            message.put("createdAt", notification.getCreatedAt());
            message.put("referenceId", notification.getReferenceId());
            message.put("referenceType", notification.getReferenceType());
            
            messagingTemplate.convertAndSend(destination, message);
            
            log.info("Sent push notification to user: {}, title: {}", 
                    notification.getRecipient().getId(), 
                    notification.getTitle());
        } catch (Exception e) {
            log.error("Failed to send push notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Gửi thông báo broadcast đến tất cả users
     */
    public void sendBroadcastNotification(String title, String message) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("title", title);
            payload.put("message", message);
            
            messagingTemplate.convertAndSend("/topic/notifications/broadcast", payload);
            
            log.info("Sent broadcast notification: {}", title);
        } catch (Exception e) {
            log.error("Failed to send broadcast notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Gửi thông báo đến một building cụ thể
     */
    public void sendBuildingNotification(String buildingId, String title, String message) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("title", title);
            payload.put("message", message);
            
            messagingTemplate.convertAndSend(
                    "/topic/notifications/building/" + buildingId, 
                    payload);
            
            log.info("Sent building notification to building: {}", buildingId);
        } catch (Exception e) {
            log.error("Failed to send building notification: {}", e.getMessage(), e);
        }
    }
}