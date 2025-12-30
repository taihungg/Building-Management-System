package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.util.UUID;

import itep.software.bluemoon.enumeration.InvoiceStatus;

public interface InvoiceInfoSummary {
    UUID getId();
    String getApartmentLabel();
    Integer getMonth();
    Integer getYear();
    BigDecimal getTotalAmount();
    BigDecimal getPaidAmount();
    InvoiceStatus getStatus();
}
