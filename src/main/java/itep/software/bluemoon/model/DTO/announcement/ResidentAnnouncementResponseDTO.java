package itep.software.bluemoon.model.DTO.announcement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentAnnouncementResponseDTO {
    private UUID id;           
    private String title;
    private String message;
    private String senderName;  
    private LocalDateTime createdAt;
    private Boolean isRead;     
}