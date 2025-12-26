package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.enumeration.ServiceCode;
import itep.software.bluemoon.model.DTO.accounting.AccountingDashboardResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.MonthlyRevenueDTO;
import itep.software.bluemoon.model.DTO.accounting.RevenueDistributionDTO;
import itep.software.bluemoon.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
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

    public List<RevenueDistributionDTO> getRevenueDistribution(int month, int year) {
        List<Object[]> rawData = invoiceRepository.findRevenueDistribution(month, year);

        List<RevenueDistributionDTO> result = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Object[] row : rawData) {
            BigDecimal amount = (BigDecimal) row[1];
            if (amount != null) {
                totalRevenue = totalRevenue.add(amount);
            }
        }

        for (Object[] row : rawData) {
            ServiceCode code = (ServiceCode) row[0];
            BigDecimal amount = (BigDecimal) row[1];

            if (amount == null) amount = BigDecimal.ZERO;

            Double percentage = 0.0;
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.multiply(BigDecimal.valueOf(100))
                        .divide(totalRevenue, 2, RoundingMode.HALF_UP) // Lấy 2 số thập phân
                        .doubleValue();
            }

            result.add(new RevenueDistributionDTO(
                    convertToVietnamese(code),
                    amount,
                    percentage
            ));
        }

        return result;
    }

    private String convertToVietnamese(ServiceCode code) {
        if (code == null) return "Khác";
        return switch (code) {
            case ServiceCode.ELECTRICITY -> "Tiền điện";
            case ServiceCode.WATER -> "Tiền nước";
            case ServiceCode.PARKING -> "Phí gửi xe";
            case ServiceCode.MANAGEMENT -> "Phí quản lý";
            case ServiceCode.OTHER -> "Phí dịch vụ khác";
            default -> code.name();
        };
    }
}