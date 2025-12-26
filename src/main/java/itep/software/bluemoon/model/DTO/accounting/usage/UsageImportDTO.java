package itep.software.bluemoon.model.DTO.accounting.usage;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageImportDTO {
    private String apartmentCode;
    private String buildingCode;
    private String serviceCode;
    private BigDecimal oldIndex;
    private BigDecimal newIndex;
    private BigDecimal quantity;

    private boolean isValid;
    private boolean hasWarning;
    private String message;
}