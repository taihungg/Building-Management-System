package itep.software.bluemoon.model.DTO.announcement;
import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import lombok.Data;
import java.util.UUID;
import java.util.List;

@Data
public class AnnouncementCreateRequestDTO {
	private String title;
    private String message;
    private UUID senderId;
    private AnnouncementTargetType targetType;
    private String targetDetail;
}