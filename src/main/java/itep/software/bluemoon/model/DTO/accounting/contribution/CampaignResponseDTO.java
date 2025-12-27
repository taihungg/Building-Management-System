package itep.software.bluemoon.model.DTO.accounting.contribution;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import itep.software.bluemoon.enumeration.CampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignResponseDTO {
    
    private UUID id;
    private String title;
    private String description;
    private BigDecimal goalAmount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate campaignEndDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate contributionDeadline;
    
    private CampaignStatus status;
    private Boolean isPublic;
    private BigDecimal totalCollected;
    private Integer totalContributors;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}