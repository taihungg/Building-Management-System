package itep.software.bluemoon.model.DTO.announcement;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import lombok.Data;

@Data
public class AnnouncementCreateRequestDTO {
    private String title;
    private String message;
    private UUID senderId;
    private AnnouncementTargetType targetType;

    // Các trường mới để nhận ID từ FE
    private UUID buildingId;         // Bắt buộc khi chọn BY_BUILDING hoặc BY_FLOOR
    private List<Integer> floors;    // Danh sách tầng, ví dụ: [10, 11, 12]
    private List<UUID> apartmentIds; // Danh sách ID căn hộ cụ thể
    
    private String targetDetail;
}