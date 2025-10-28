package itep.software.bluemoon.dto.request;

import itep.software.bluemoon.enumeration.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    // Gửi đến một người cụ thể
    private UUID recipientId;
    
    // Hoặc gửi đến nhiều người
    private List<UUID> recipientIds;
    
    // Hoặc gửi đến toàn bộ residents của một building
    private UUID buildingId;
    
    // Hoặc gửi đến toàn bộ residents của một apartment
    private UUID apartmentId;
    
    // Reference cho entity liên quan
    private UUID referenceId;
    private String referenceType;
}