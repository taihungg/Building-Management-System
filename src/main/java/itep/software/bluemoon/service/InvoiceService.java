package itep.software.bluemoon.service;

import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.InvoiceDetailRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final InvoiceDetailRepository invoiceDetailResitory;
}
