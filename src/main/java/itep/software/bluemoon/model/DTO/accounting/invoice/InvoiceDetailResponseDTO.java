package itep.software.bluemoon.model.DTO.accounting.invoice;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceDetailResponseDTO {
    private UUID id;
    private String serviceTitle;
    private String serviceUnit;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amountInitial;
    private BigDecimal vat;
    private BigDecimal env;
    private BigDecimal amount;
    private String description;
    
    // Cho điện/nước
    private BigDecimal oldIndex;
    private BigDecimal newIndex;
}
