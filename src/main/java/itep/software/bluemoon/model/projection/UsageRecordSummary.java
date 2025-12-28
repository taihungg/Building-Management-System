package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.util.UUID;

public interface UsageRecordSummary {
    UUID getId();
    String getApartmentLabel();
    String getServiceName();
    BigDecimal getOldIndex();
    BigDecimal getNewIndex();
    BigDecimal getQuantity();
    Integer getMonth();
    Integer getYear();
}