package itep.software.bluemoon.dto.request;

import itep.software.bluemoon.enumeration.NotificationType;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationFilterRequest {
    
    // Lọc theo loại thông báo
    private List<NotificationType> types;
    
    // Lọc theo trạng thái đã đọc
    private Boolean isRead;
    
    // Lọc theo khoảng thời gian
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;
    
    // Phân trang
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 20;
    
    // Sắp xếp
    @Builder.Default
    private String sortBy = "createdAt";
    
    @Builder.Default
    private String sortDirection = "DESC";
}