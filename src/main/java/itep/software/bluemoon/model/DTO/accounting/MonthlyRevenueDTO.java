package itep.software.bluemoon.model.DTO.accounting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDTO {
    private Integer month;
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
}