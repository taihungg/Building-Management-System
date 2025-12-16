package itep.software.bluemoon.service;

import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.model.DTO.accounting.AccountingDashboardResponseDTO;
import itep.software.bluemoon.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

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
}