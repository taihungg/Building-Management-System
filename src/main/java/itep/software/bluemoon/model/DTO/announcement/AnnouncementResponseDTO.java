package itep.software.bluemoon.model.DTO.announcement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnnouncementResponseDTO {
    private UUID id;
    private String title;
    private String message;
    private UUID senderId;
    private String senderName;
    private List<UUID> receiverIds;
    private int receiverCount;
    private LocalDateTime createdAt;
}