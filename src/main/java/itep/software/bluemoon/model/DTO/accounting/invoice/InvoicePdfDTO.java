package itep.software.bluemoon.model.DTO.accounting.invoice;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoicePdfDTO {
    private String invoiceId;
    private String customerName;
    private String roomNumber;
    private String dateStr;
    private String billingMonthTitle;

    private FeeSectionDTO managementFee;
    private UtilitySectionDTO electricity;
    private UtilitySectionDTO water;
    private FeeSectionDTO vehicleFee;

    private List<FeeSectionDTO> extraFees;

    private String totalAmount;
    private String totalAmountText;

    @Data
    @Builder
    public static class FeeSectionDTO {
        private String title;
        private String quantity;
        private String unitPrice;
        private String totalAmount;
        private List<InvoiceLineItemDTO> subItems; 
    }

    @Data
    @Builder
    public static class UtilitySectionDTO {
        private String startDate;
        private String endDate;
        private String oldIndex;
        private String newIndex;
        private String consumption;
        private String totalAmountNoTax;
        private String vat;
        private String envFee;
        private String totalAmountWithTax;
        private List<InvoiceLineItemDTO> tiers;
    }
}