package itep.software.bluemoon.model.DTO.accounting;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class UpdatePaymentRequestDTO {
    private BigDecimal paymentAmount;
}
