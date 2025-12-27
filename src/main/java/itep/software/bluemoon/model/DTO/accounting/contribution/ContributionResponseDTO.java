package itep.software.bluemoon.model.DTO.accounting.contribution;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContributionResponseDTO {
    private UUID id;
    private UUID campaignId;
    private String contributorName;
    private String phone;
    private String address;
    private BigDecimal amount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate contributionDate;
    
    private String note;
}