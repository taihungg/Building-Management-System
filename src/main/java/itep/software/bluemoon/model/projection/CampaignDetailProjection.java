package itep.software.bluemoon.model.projection;

import java.util.List;

public interface CampaignDetailProjection extends CampaignSummary {
    List<ContributionSummary> getContributions();
}