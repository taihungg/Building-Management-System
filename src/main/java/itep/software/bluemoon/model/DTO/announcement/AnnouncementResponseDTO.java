package itep.software.bluemoon.model.DTO.announcement;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor 
public class AnnouncementResponseDTO {
    private UUID id;
    private String title;
    private String message; 
    private String senderName;
    private LocalDateTime createdAt;
    
    private String targetType;   // VD: BY_FLOOR
    private String targetDetail; // VD: "Tầng 5"
    private Long receiverCount;  // VD: 15 (số lượng người nhận)
}