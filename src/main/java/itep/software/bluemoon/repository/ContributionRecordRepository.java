package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import itep.software.bluemoon.entity.accounting.ContributionRecord;
import itep.software.bluemoon.model.projection.ContributionSummary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



@Repository
public interface ContributionRecordRepository extends JpaRepository<ContributionRecord, UUID> {
    
    List<ContributionSummary> findByCampaignId(UUID campaignId);
    
    @Query("SELECT c.id AS id, " +
    	       "c.contributorName AS contributorName, " +
    	       "c.phone AS phone, " +
    	       "c.address AS address, " +
    	       "c.amount AS amount, " +
    	       "c.contributionDate AS contributionDate " +
    	       "FROM ContributionRecord c " +
    	       "WHERE c.campaign.id = :campaignId " +
    	       "ORDER BY c.contributionDate ASC")
    List<ContributionSummary> findByCampaignIdOrderByContributionDateAsc(@Param("campaignId") UUID campaignId);
}