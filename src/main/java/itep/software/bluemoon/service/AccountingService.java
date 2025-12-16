package itep.software.bluemoon.service;

import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.model.DTO.accounting.AccountingDashboardResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.MonthlyRevenueDTO;
import itep.software.bluemoon.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountingService {

    private final InvoiceRepository invoiceRepository;

    public AccountingDashboardResponseDTO getDashboardMetrics() {

        BigDecimal revAmount = invoiceRepository.sumTotalAmountByStatus(InvoiceStatus.PAID);
        long revCount = invoiceRepository.countByStatus(InvoiceStatus.PAID);

        BigDecimal debtAmount = invoiceRepository.sumTotalAmountByStatus(InvoiceStatus.UNPAID);
        long debtCount = invoiceRepository.countByStatus(InvoiceStatus.UNPAID);

        BigDecimal pendAmount = invoiceRepository.sumTotalAmountByStatus(InvoiceStatus.PENDING);
        long pendCount = invoiceRepository.countByStatus(InvoiceStatus.PENDING);

        long totalInvoices = invoiceRepository.count();

        return AccountingDashboardResponseDTO.builder()
                .revenue(AccountingDashboardResponseDTO.DashboardMetricDTO.builder()
                        .totalAmount(revAmount)
                        .invoiceCount(revCount)
                        .build())

                .receivable(AccountingDashboardResponseDTO.DashboardMetricDTO.builder()
                        .totalAmount(debtAmount)
                        .invoiceCount(debtCount)
                        .build())

                .pending(AccountingDashboardResponseDTO.DashboardMetricDTO.builder()
                        .totalAmount(pendAmount)
                        .invoiceCount(pendCount)
                        .build())

                .totalInvoices(totalInvoices)
                .build();
    }
    
    public List<MonthlyRevenueDTO> getRevenueChartData(int year) {
        List<Object[]> rawData = invoiceRepository.findMonthlyRevenueByYear(year);

        Map<Integer, MonthlyRevenueDTO> dataMap = new HashMap<>();
        
        for (Object[] row : rawData) {
                Integer month = ((Number) row[0]).intValue();
                BigDecimal total = (BigDecimal) row[1];
                BigDecimal paid = (BigDecimal) row[2];
                
                dataMap.put(month, new MonthlyRevenueDTO(month, total, paid));
        }

        List<MonthlyRevenueDTO> fullYearData = new ArrayList<>();
        
        for (int m = 1; m <= 12; m++) {
                if (dataMap.containsKey(m)) {
                fullYearData.add(dataMap.get(m));
                } else {
                fullYearData.add(new MonthlyRevenueDTO(m, BigDecimal.ZERO, BigDecimal.ZERO));
                }
        }

        return fullYearData;
        }
}