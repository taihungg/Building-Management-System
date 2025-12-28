package itep.software.bluemoon.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.accounting.VoluntaryContribution;
import itep.software.bluemoon.enumeration.CampaignStatus;
import itep.software.bluemoon.model.projection.*;

@Repository
public interface VoluntaryContributionRepository extends JpaRepository<VoluntaryContribution, UUID> {
    
    List<CampaignSummary> findAllProjectedBy();
    
    List<CampaignSummary> findByStatus(CampaignStatus status);
    
    Optional<CampaignSummary> findProjectedById(UUID id);
    
    Optional<CampaignDetailProjection> findDetailById(UUID id);
}