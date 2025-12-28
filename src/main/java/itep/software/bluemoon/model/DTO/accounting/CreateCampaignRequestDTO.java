package itep.software.bluemoon.model.DTO.accounting;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class CreateCampaignRequestDTO {
    private String title;
    private String description;
    private BigDecimal goalAmount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate campaignEndDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate contributionDeadline;

    private boolean isPublic = true;
}