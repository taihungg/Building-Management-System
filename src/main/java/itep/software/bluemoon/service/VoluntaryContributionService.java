package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.accounting.ContributionRecord;
import itep.software.bluemoon.entity.accounting.VoluntaryContribution;
import itep.software.bluemoon.enumeration.CampaignStatus;
import itep.software.bluemoon.model.DTO.accounting.contribution.AddContributionRequestDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.CampaignResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.ContributionResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.CreateCampaignRequestDTO;
import itep.software.bluemoon.repository.ContributionRecordRepository;
import itep.software.bluemoon.repository.VoluntaryContributionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class VoluntaryContributionService {
    private final VoluntaryContributionRepository campaignRepository;
    private final ContributionRecordRepository contributionRepository;
    
    @SuppressWarnings("null")
    public CampaignResponseDTO createCampaign(CreateCampaignRequestDTO request) {

        if (request.getContributionDeadline().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Contribution deadline must be after start date");
        }
        
        if (request.getCampaignEndDate().isBefore(request.getContributionDeadline())) {
            throw new IllegalArgumentException("Campaign end date must be after contribution deadline");
        }
        
        VoluntaryContribution campaign = VoluntaryContribution.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .goalAmount(request.getGoalAmount())
                .startDate(request.getStartDate())
                .campaignEndDate(request.getCampaignEndDate())
                .contributionDeadline(request.getContributionDeadline())
                .status(CampaignStatus.ACTIVE)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .totalCollected(BigDecimal.ZERO)
                .totalContributors(0)
                .build();
        
        VoluntaryContribution saved = campaignRepository.save(campaign);
        
        return mapToResponse(saved);
    }
    
    public Page<CampaignResponseDTO> getAllCampaigns(CampaignStatus status, Pageable pageable) {
        Page<VoluntaryContribution> campaigns;
        
        if (status != null) {
            campaigns = campaignRepository.findByStatus(status, pageable);
        } else {
            campaigns = campaignRepository.findAll(pageable);
        }
        
        return campaigns.map(this::mapToResponse);
    }
    
    public ContributionResponseDTO addContribution(UUID campaignId, AddContributionRequestDTO request) {
        VoluntaryContribution campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + campaignId));
        
        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new IllegalStateException("Campaign is not accepting contributions");
        }
        
        ContributionRecord contribution = ContributionRecord.builder()
                .campaign(campaign)
                .contributorName(request.getContributorName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .amount(request.getAmount())
                .contributionDate(request.getContributionDate())
                .build();
        
        ContributionRecord saved = contributionRepository.save(contribution);
        
        // Update campaign statistics
        campaign.setTotalCollected(campaign.getTotalCollected().add(request.getAmount()));
        campaign.setTotalContributors(campaign.getTotalContributors() + 1);
        campaignRepository.save(campaign);
        
        return mapToContributionResponse(saved);
    }
    
    public Page<ContributionResponseDTO> getContributionsByCampaign(UUID campaignId, Pageable pageable) {
        // Check if campaign exists
        if (!campaignRepository.existsById(campaignId)) {
            throw new IllegalArgumentException("Campaign not found with id: " + campaignId);
        }
        
        // Get contributions with pagination
        Page<ContributionRecord> contributions = contributionRepository.findByCampaignId(campaignId, pageable);
        
        // Map to response DTO
        return contributions.map(this::mapToContributionResponse);
    }
    
    
    private ContributionResponseDTO mapToContributionResponse(ContributionRecord record) {
        return ContributionResponseDTO.builder()
                .id(record.getId())
                .campaignId(record.getCampaign().getId())
                .contributorName(record.getContributorName())
                .phone(record.getPhone())
                .address(record.getAddress())
                .amount(record.getAmount())
                .contributionDate(record.getContributionDate())
                .build();
    }
    
    private CampaignResponseDTO mapToResponse(VoluntaryContribution campaign) {
        return CampaignResponseDTO.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .goalAmount(campaign.getGoalAmount())
                .startDate(campaign.getStartDate())
                .campaignEndDate(campaign.getCampaignEndDate())
                .contributionDeadline(campaign.getContributionDeadline())
                .status(campaign.getStatus())
                .isPublic(campaign.isPublic())
                .totalCollected(campaign.getTotalCollected())
                .totalContributors(campaign.getTotalContributors())
                .createdAt(campaign.getCreatedDate())
                .updatedAt(campaign.getLastModifiedDate())
                .build();
    }
}