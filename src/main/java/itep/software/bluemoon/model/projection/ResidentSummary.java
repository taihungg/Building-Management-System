package itep.software.bluemoon.model.projection;

import java.util.UUID;

import itep.software.bluemoon.enumeration.ResidentStatus;

public interface ResidentSummary {
    UUID getId();
    String getFullName();
    String getEmail();
    String getPhone();
    Integer getRoomNumber();
    ResidentStatus getStatus();
}
