package itep.software.bluemoon.service;

import itep.software.bluemoon.model.projection.InvoiceSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.InvoiceDetailRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final InvoiceDetailRepository invoiceDetailResitory;

    public List<InvoiceSummary> getInvoiceSummary(Integer month, Integer year){
        return invoiceRepository.getInvoiceSummary(month, year);
    }
}
