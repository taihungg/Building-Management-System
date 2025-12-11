package itep.software.bluemoon.model.projection;

import java.time.LocalDateTime;
import java.util.UUID;

import itep.software.bluemoon.enumeration.InvoiceStatus;

public interface InvoiceSummary {
    UUID getId();
    String getApartmentLabel();
    Double getTotalAmount();
    InvoiceStatus getStatus();
    LocalDateTime getPaymentDate();
    LocalDateTime getCreatedTime();
}
