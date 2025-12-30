package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.util.UUID;

public interface UsageRecordSummary {
    UUID getId();
    String getApartmentCode();
    String getBuildingCode();
    String getServiceCode();
    BigDecimal getOldIndex();
    BigDecimal getNewIndex();
    BigDecimal getQuantity();
}