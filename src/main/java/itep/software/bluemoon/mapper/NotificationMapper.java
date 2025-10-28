package itep.software.bluemoon.mapper;

import itep.software.bluemoon.dto.NotificationDTO;
import itep.software.bluemoon.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    
    public NotificationDTO toDTO(Notification notification) {
        if (notification == null) {
            return null;
        }
        
        // Build recipient name safely (handle lazy loading)
        String recipientName = "";
        if (notification.getRecipient() != null) {
            recipientName = notification.getRecipient().getFirstName();
            if (notification.getRecipient().getLastName() != null) {
                recipientName += " " + notification.getRecipient().getLastName();
            }
        }
        
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .recipientId(notification.getRecipient() != null ? 
                            notification.getRecipient().getId() : null)
                .recipientName(recipientName)
                .build();
    }
    
    public Notification toEntity(NotificationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Notification.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType())
                .isRead(dto.isRead())
                .createdAt(dto.getCreatedAt())
                .readAt(dto.getReadAt())
                .referenceId(dto.getReferenceId())
                .referenceType(dto.getReferenceType())
                .build();
    }
}