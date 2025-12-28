package itep.software.bluemoon.model.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AnnouncementDetailSummary {
    UUID getId();
    String getTitle();
    String getMessage();
    String getSenderName();
    String getTargetType();
    String getTargetDetail();
    LocalDateTime getCreatedDate();
}
