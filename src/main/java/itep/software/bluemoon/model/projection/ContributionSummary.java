package itep.software.bluemoon.model.projection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface ContributionSummary {
    UUID getId();
    UUID getCampaignId();
    String getContributorName();
    String getPhone();
    String getAddress();
    BigDecimal getAmount();
    LocalDate getContributionDate();
}