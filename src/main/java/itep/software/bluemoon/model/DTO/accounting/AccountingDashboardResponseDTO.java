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
public class AccountingDashboardResponseDTO {
    private DashboardMetricDTO revenue;
    private DashboardMetricDTO receivable;
    private DashboardMetricDTO pending;
    private Long totalInvoices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardMetricDTO {
        private BigDecimal totalAmount;
        private Long invoiceCount;
    }
}