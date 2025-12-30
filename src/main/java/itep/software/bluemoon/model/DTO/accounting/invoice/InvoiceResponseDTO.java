package itep.software.bluemoon.model.DTO.accounting.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.enumeration.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceResponseDTO {
    private UUID id;
    private int roomNumber;
    private int month;
    private int year;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private InvoiceStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime overdueDate;
    
    private List<InvoiceDetailResponseDTO> details;
}