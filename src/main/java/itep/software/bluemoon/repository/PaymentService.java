package itep.software.bluemoon.repository;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.model.DTO.accounting.UpdatePaymentRequestDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    private final InvoiceRepository invoiceRepository;

    @SuppressWarnings("null")
    public void updateInvoicePayment(UUID invoiceId, UpdatePaymentRequestDTO request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PENDING) {
            throw new RuntimeException("Cannot update payment for PENDING invoice. Please confirm invoice first.");
        }

        BigDecimal paymentAmount = request.getPaymentAmount();
        if(paymentAmount.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Amount paid must be bigger than zero!");
        }
        BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal total = invoice.getTotalAmount();

        BigDecimal newPaidAmount = currentPaid.add(paymentAmount);

        if (newPaidAmount.compareTo(total) > 0) {
            throw new RuntimeException("Amount paid over Amount!");
        }

        invoice.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(total) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIAL); 
        }

        invoiceRepository.save(invoice);
    }
}
