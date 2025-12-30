package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.entity.accounting.InvoiceDetail;
import itep.software.bluemoon.entity.accounting.UsageRecord;
import itep.software.bluemoon.enumeration.ServiceCode;
import itep.software.bluemoon.model.DTO.accounting.invoice.InvoiceLineItemDTO;
import itep.software.bluemoon.model.DTO.accounting.invoice.InvoicePdfDTO;
import itep.software.bluemoon.repository.InvoiceRepository;
import itep.software.bluemoon.util.VndUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PdfMappingService {

    private final ObjectMapper objectMapper;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final InvoiceRepository invoiceRepository;

    public InvoicePdfDTO convertToPdfDTO(UUID id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));

        String monthYear = String.format("%02d/%d", invoice.getMonth(), invoice.getYear());
        
        InvoicePdfDTO.InvoicePdfDTOBuilder builder = InvoicePdfDTO.builder();
        builder.invoiceId(invoice.getId().toString());
        builder.customerName(invoice.getApartment().getOwner() != null ? invoice.getApartment().getOwner().getFullName() : "Khách hàng");
        builder.roomNumber(String.valueOf(invoice.getApartment().getRoomNumber()));
        builder.dateStr(invoice.getCreatedDate().format(dateFormatter));
        builder.billingMonthTitle("THÁNG " + monthYear);
        builder.totalAmount(VndUtils.format(invoice.getTotalAmount()));

        List<InvoicePdfDTO.FeeSectionDTO> extraFeeList = new ArrayList<>();

        for (InvoiceDetail detail : invoice.getDetails()) {
            ServiceCode code = detail.getServiceType().getCode();
            switch (code) {
                case MANAGEMENT -> {
                    var mgmt = mapSimpleFee(detail);
                    mgmt.setTitle(detail.getServiceType().getTitle());
                    builder.managementFee(mgmt);
                }
                case ELECTRICITY -> builder.electricity(mapUtility(detail));
                case WATER -> builder.water(mapUtility(detail));
                case PARKING -> {
                    var park = mapSimpleFee(detail);
                    park.setTitle(detail.getServiceType().getTitle());
                    builder.vehicleFee(park);
                }
                case OTHER -> {
                    var extra = mapSimpleFee(detail);
                    extra.setTitle(detail.getDescription());
                    extraFeeList.add(extra);
                }
            }
        }
        builder.extraFees(extraFeeList);
        return builder.build();
    }

    private InvoicePdfDTO.FeeSectionDTO mapSimpleFee(InvoiceDetail detail) {
        return InvoicePdfDTO.FeeSectionDTO.builder()
                .title("") // Sẽ set bên ngoài
                .quantity(formatDecimal(detail.getQuantity()))
                .unitPrice(VndUtils.format(detail.getUnitPrice()))
                .totalAmount(VndUtils.format(detail.getAmount()))
                .subItems(parseLineItems(detail.getLineItems()))
                .build();
    }

    private InvoicePdfDTO.UtilitySectionDTO mapUtility(InvoiceDetail detail) {
        UsageRecord usage = detail.getUsageRecord();
        // Lấy ngày chốt từ usage (nếu có) hoặc fake tạm từ tháng hóa đơn
        String start = "24/" + String.format("%02d", detail.getInvoice().getMonth() - 1) + "/" + detail.getInvoice().getYear();
        String end = "24/" + String.format("%02d", detail.getInvoice().getMonth()) + "/" + detail.getInvoice().getYear();

        return InvoicePdfDTO.UtilitySectionDTO.builder()
                .startDate(start).endDate(end)
                .oldIndex(usage != null ? formatDecimal(usage.getOldIndex()) : "0")
                .newIndex(usage != null ? formatDecimal(usage.getNewIndex()) : "0")
                .consumption(formatDecimal(detail.getQuantity()))
                .totalAmountNoTax(VndUtils.format(detail.getAmountInitial()))
                .vat(VndUtils.format(detail.getVat()))
                .envFee(detail.getEnv() != null ? VndUtils.format(detail.getEnv()) : "")
                .totalAmountWithTax(VndUtils.format(detail.getAmount()))
                .tiers(parseLineItems(detail.getLineItems()))
                .build();
    }

    private List<InvoiceLineItemDTO> parseLineItems(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<InvoiceLineItemDTO>>() {});
        } catch (JsonProcessingException e) { return new ArrayList<>(); }
    }
    
    private String formatDecimal(BigDecimal num) {
        if (num == null) return "0";
        return String.format(Locale.US, "%,.0f", num); // Format số lượng không có thập phân (328)
    }
}