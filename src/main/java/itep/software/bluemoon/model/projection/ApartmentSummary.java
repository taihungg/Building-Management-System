package itep.software.bluemoon.model.projection;

import java.util.UUID;

public interface ApartmentSummary {
    UUID getId();
    String getLabel();
    Integer getFloor();
    Double getArea();
    Integer getResidentNumber();
}
