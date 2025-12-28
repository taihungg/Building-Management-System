package itep.software.bluemoon.model.DTO.accounting;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class AddContributionRequestDTO {
    private UUID campaignId;
    private String contributorName;

    private String phone;
    private String address;
    private BigDecimal amount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate contributionDate;
}