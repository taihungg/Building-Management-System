package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import itep.software.bluemoon.entity.accounting.ContributionRecord;
import itep.software.bluemoon.model.projection.ContributionSummary;



@Repository
public interface ContributionRecordRepository extends JpaRepository<ContributionRecord, UUID> {
    
    Page<ContributionRecord> findByCampaignId(UUID campaignId, Pageable pageable);
    
    List<ContributionSummary> findByCampaignId(UUID campaignId);
}