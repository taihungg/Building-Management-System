package itep.software.bluemoon.model.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AnnouncementSummary {
    UUID getId();
    String getTitle();
    String getMessage();
    String getSenderName();
    LocalDateTime getCreatedAt();
}