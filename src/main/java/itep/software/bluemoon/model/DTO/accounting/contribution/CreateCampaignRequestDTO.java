package itep.software.bluemoon.model.DTO.accounting.contribution;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampaignRequestDTO {
	@NotBlank(message = "Title is required")
	private String title;
	private String description;
	private BigDecimal goalAmount;
	    
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate startDate;
	    
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate campaignEndDate;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate contributionDeadline;
	    
	@Builder.Default
	private Boolean isPublic = true;    
}