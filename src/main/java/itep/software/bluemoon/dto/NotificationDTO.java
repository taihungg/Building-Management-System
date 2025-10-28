package itep.software.bluemoon.dto;

import itep.software.bluemoon.enumeration.NotificationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private UUID id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private UUID referenceId;
    private String referenceType;
    private UUID recipientId;
    private String recipientName;
}