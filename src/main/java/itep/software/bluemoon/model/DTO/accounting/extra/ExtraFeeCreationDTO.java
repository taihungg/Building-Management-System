package itep.software.bluemoon.model.DTO.accounting.extra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtraFeeCreationDTO {
    private UUID apartmentId;
    private String title;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private boolean isBilled;
    private Integer year;
    private Integer month;
    private Integer day;
}