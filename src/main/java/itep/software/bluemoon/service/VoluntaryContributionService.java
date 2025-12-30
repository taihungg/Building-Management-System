package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.accounting.ContributionRecord;
import itep.software.bluemoon.entity.accounting.VoluntaryContribution;
import itep.software.bluemoon.enumeration.CampaignStatus;
import itep.software.bluemoon.model.DTO.accounting.AddContributionRequestDTO;
import itep.software.bluemoon.model.DTO.accounting.CreateCampaignRequestDTO;
import itep.software.bluemoon.model.projection.CampaignSummary;
import itep.software.bluemoon.model.projection.ContributionSummary;
import itep.software.bluemoon.repository.ContributionRecordRepository;
import itep.software.bluemoon.repository.VoluntaryContributionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class VoluntaryContributionService {

    private final VoluntaryContributionRepository voluntaryContributionRepository;
    private final ContributionRecordRepository contributionRecordRepository;
    
    @SuppressWarnings("null")
    public VoluntaryContribution createCampaign(CreateCampaignRequestDTO request) {
        validateCampaignDates(request);
        
        VoluntaryContribution campaign = VoluntaryContribution.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .goalAmount(request.getGoalAmount())
                .startDate(request.getStartDate())
                .campaignEndDate(request.getCampaignEndDate())
                .contributionDeadline(request.getContributionDeadline())
                .isPublic(request.isPublic())
                .status(CampaignStatus.DRAFT)
                .totalCollected(BigDecimal.ZERO)
                .totalContributors(0)
                .build();

        return voluntaryContributionRepository.save(campaign);
    }
    
    /**
     * Xem danh sách các chiến dịch
     */
    @Transactional(readOnly = true)
    public List<CampaignSummary> getAllCampaignSummaries() {
        return voluntaryContributionRepository.findAllProjectedBy();
    }

    private void validateCampaignDates(CreateCampaignRequestDTO request) {
        //Ngày kết thúc phải sau ngày bắt đầu
        if (request.getCampaignEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Campaign end date must be after start date.");
        }

        //Hạn chót đóng góp phải sau ngày bắt đầu
        if (request.getContributionDeadline().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Contribution deadline must be after start date.");
        }

        //Hạn chót đóng góp không được sau ngày kết thúc chiến dịch
        if (request.getContributionDeadline().isAfter(request.getCampaignEndDate())) {
            throw new IllegalArgumentException("Contribution deadline cannot be after campaign end date.");
        }
    }
    
    /**
     * Thêm đóng góp thủ công
     */
    @SuppressWarnings("null")
    public ContributionRecord addContribution(AddContributionRequestDTO request) {
        VoluntaryContribution campaign = voluntaryContributionRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        // Tạo bản ghi đóng góp
        ContributionRecord record = ContributionRecord.builder()
                .campaign(campaign)
                .contributorName(request.getContributorName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .amount(request.getAmount())
                .contributionDate(request.getContributionDate())
                .build();

        // Cập nhật tổng số tiền và số người đóng góp trong Campaign
        campaign.setTotalCollected(campaign.getTotalCollected().add(request.getAmount()));
        campaign.setTotalContributors(campaign.getTotalContributors() + 1);
        
        voluntaryContributionRepository.save(campaign);
        return contributionRecordRepository.save(record);
    }
    
    /**
     * Lấy chi tiết chiến dịch và danh sách đóng góp
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCampaignDetail(UUID campaignId) {
        //thông tin campaign dưới dạng Summary (interface bạn đã có)
        CampaignSummary campaign = voluntaryContributionRepository.findProjectedById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        //danh sách đóng góp dưới dạng Summary
        List<ContributionSummary> contributions = contributionRecordRepository.findByCampaignId(campaignId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaign", campaign);   
        data.put("contributions", contributions);

        return data;
    }
    
    /**
     * API Xóa chiến dịch
     */
    public void deleteCampaign(UUID id) {
    	VoluntaryContribution campaign = voluntaryContributionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch với ID: " + id));
        
        if (campaign.getTotalContributors() != null && campaign.getTotalContributors() > 0) {
            throw new IllegalArgumentException("Không thể xóa chiến dịch đã có người đóng góp. Vui lòng chuyển trạng thái sang CLOSED.");
        }
        voluntaryContributionRepository.deleteById(id);
    }
    
    /**
     * API Sửa đổi thông tin chiến dịch
     */
    public VoluntaryContribution updateCampaign(UUID id, CreateCampaignRequestDTO request) {
        VoluntaryContribution campaign = voluntaryContributionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));

        if (request.getTitle() != null) {
            campaign.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            campaign.setDescription(request.getDescription());
        }
        if (request.getGoalAmount() != null) {
            campaign.setGoalAmount(request.getGoalAmount());
        }
        if (request.getStartDate() != null) {
            campaign.setStartDate(request.getStartDate());
        }
        if (request.getCampaignEndDate() != null) {
            campaign.setCampaignEndDate(request.getCampaignEndDate());
        }
        if (request.getContributionDeadline() != null) {
            campaign.setContributionDeadline(request.getContributionDeadline());
        }
        
        if (request.isPublic() != campaign.isPublic()) {
            campaign.setPublic(request.isPublic());
        }
        validateDatesForUpdate(campaign);

        return voluntaryContributionRepository.save(campaign);
    }

    private void validateDatesForUpdate(VoluntaryContribution c) {
        if (c.getCampaignEndDate().isBefore(c.getStartDate())) {
            throw new IllegalArgumentException("Campaign end date must be after start date.");
        }
        if (c.getContributionDeadline().isBefore(c.getStartDate())) {
            throw new IllegalArgumentException("Contribution deadline must be after start date.");
        }
        if (c.getContributionDeadline().isAfter(c.getCampaignEndDate())) {
            throw new IllegalArgumentException("Contribution deadline cannot be after campaign end date.");
        }
    }
}