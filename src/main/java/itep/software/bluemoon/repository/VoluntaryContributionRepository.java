package itep.software.bluemoon.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.accounting.VoluntaryContribution;
import itep.software.bluemoon.enumeration.CampaignStatus;

@Repository
public interface VoluntaryContributionRepository extends JpaRepository<VoluntaryContribution, UUID> {
	Page<VoluntaryContribution> findAll(Pageable pageable);
    Page<VoluntaryContribution> findByStatus(CampaignStatus status, Pageable pageable);
}