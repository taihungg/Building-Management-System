package itep.software.bluemoon.model.DTO.announcement;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import lombok.Data;

@Data
public class AnnouncementUpdateRequestDTO {
    private String title;
    private String message;
    
    private AnnouncementTargetType targetType;
    private UUID buildingId;
    private List<Integer> floors;
    private List<UUID> apartmentIds;
    private String targetDetail; // Nếu null sẽ tự generate
}