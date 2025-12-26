package itep.software.bluemoon.model.DTO.announcement;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnnouncementResponseDTO {
	private UUID id;
    private String title;
    private String message;
    private String senderName;
    private LocalDateTime createdAt;
    private Boolean isRead;
}