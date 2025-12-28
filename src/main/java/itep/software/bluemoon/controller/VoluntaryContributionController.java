package itep.software.bluemoon.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.enumeration.CampaignStatus;
import itep.software.bluemoon.model.DTO.accounting.contribution.AddContributionRequestDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.CampaignResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.ContributionResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.contribution.CreateCampaignRequestDTO;
import itep.software.bluemoon.service.VoluntaryContributionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
public class VoluntaryContributionController {
    private final VoluntaryContributionService campaignService;
    
    @PostMapping
    public ResponseEntity<CampaignResponseDTO> createCampaign(
            @Valid @RequestBody CreateCampaignRequestDTO request) {
        CampaignResponseDTO response = campaignService.createCampaign(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<Page<CampaignResponseDTO>> getAllCampaigns(
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<CampaignResponseDTO> campaigns = campaignService.getAllCampaigns(status, pageable);
        return ResponseEntity.ok(campaigns);
    }
    
    @PostMapping("/{campaignId}/contributions")
    public ResponseEntity<ContributionResponseDTO> addContribution(
            @PathVariable UUID campaignId,
            @Valid @RequestBody AddContributionRequestDTO request) {
        ContributionResponseDTO response = campaignService.addContribution(campaignId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{campaignId}/contributions")
    public ResponseEntity<Page<ContributionResponseDTO>> getContributions(
            @PathVariable UUID campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "contributionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<ContributionResponseDTO> contributions = campaignService.getContributionsByCampaign(campaignId, pageable);
        return ResponseEntity.ok(contributions);
    }
    
    
} 