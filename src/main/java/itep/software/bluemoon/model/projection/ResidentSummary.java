package itep.software.bluemoon.model.projection;

import java.util.UUID;

public interface ResidentSummary {
    UUID getId();
    String getFullName();
    String getEmail();
    String getPhoneNumber();
    int getRoomNumber();
}
