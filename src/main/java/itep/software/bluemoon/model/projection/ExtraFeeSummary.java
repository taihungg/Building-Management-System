package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface ExtraFeeSummary {
    UUID getId();
    String getTitle();
    BigDecimal getAmount();
    LocalDate getFeeDate();
    boolean getIsBilled();
    String getApartmentLabel();
}
