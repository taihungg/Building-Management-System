package itep.software.bluemoon.model.DTO.accounting.extra;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtraFeeDetailDTO {
    private String title;
    private String description;
    private String quantity;
    private String unitPrice;
    private String amount;
    private boolean isBilled;
    private LocalDate feeDate;
    private String apartmentLabel;
}
