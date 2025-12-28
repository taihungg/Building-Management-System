package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import itep.software.bluemoon.enumeration.CampaignStatus;

public interface CampaignSummary {
    UUID getId();
    String getTitle();
    String getDescription();
    BigDecimal getGoalAmount();
    LocalDate getStartDate();
    LocalDate getCampaignEndDate();
    LocalDate getContributionDeadline();
    CampaignStatus getStatus();
    Boolean getIsPublic();
    BigDecimal getTotalCollected();
    Integer getTotalContributors();
}