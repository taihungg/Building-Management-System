package itep.software.bluemoon.model.DTO.announcement;
import java.util.UUID;

import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import lombok.Data;

@Data
public class AnnouncementCreateRequestDTO {
	private String title;
    private String message;
    private UUID senderId;
    private AnnouncementTargetType targetType;
    private String targetDetail;
}