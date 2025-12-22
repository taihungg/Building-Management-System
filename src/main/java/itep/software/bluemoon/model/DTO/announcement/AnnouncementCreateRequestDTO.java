package itep.software.bluemoon.model.DTO.announcement;
import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import lombok.Data;
import java.util.UUID;
import java.util.List;

@Data
public class AnnouncementCreateRequestDTO {
    private String title;
    private String message;
    private UUID senderId; // Staff ID
    
    private AnnouncementTargetType targetType; // ALL, BY_BUILDING, BY_FLOOR, SPECIFIC_RESIDENTS
    private UUID buildingId; // Required if targetType = BY_BUILDING or BY_FLOOR
    private Integer floor; // Required if targetType = BY_FLOOR
    private List<UUID> apartmentIds; // Required if targetType = SPECIFIC_APARTMENTS
}