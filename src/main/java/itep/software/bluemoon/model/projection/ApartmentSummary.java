package itep.software.bluemoon.model.projection;

import java.util.UUID;

public interface ApartmentSummary {
    UUID getId();
    String getLabel();
    int getFloor();
    Double getArea();
    int getResidentNumber();
}
