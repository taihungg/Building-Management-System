package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.entity.accounting.ContributionRecord;
import itep.software.bluemoon.entity.accounting.VoluntaryContribution;
import itep.software.bluemoon.model.DTO.accounting.AddContributionRequestDTO;
import itep.software.bluemoon.model.DTO.accounting.CreateCampaignRequestDTO;
import itep.software.bluemoon.model.projection.CampaignSummary;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.ExcelExportService;
import itep.software.bluemoon.service.VoluntaryContributionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
public class VoluntaryContributionController {

    private final VoluntaryContributionService campaignService;
    private final ExcelExportService excelExportService;
    /**
     * Tạo mới một chiến dịch quyên góp
     */
    @PostMapping
    public ResponseEntity<Object> createCampaign(@Valid @RequestBody CreateCampaignRequestDTO request) {
        VoluntaryContribution newCampaign = campaignService.createCampaign(request);
        return ApiResponse.responseBuilder(
                HttpStatus.CREATED,
                "Campaign created successfully",
                newCampaign
        );
    }

    /**
     * Lấy danh sách tóm tắt tất cả các chiến dịch
     */
    @GetMapping
    public ResponseEntity<Object> getAllCampaigns() {
        List<CampaignSummary> campaigns = campaignService.getAllCampaignSummaries();
        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "List of campaigns retrieved successfully",
                campaigns
        );
    }

    /**
     * Lấy chi tiết một chiến dịch theo ID
     * Trả về thông tin chi tiết kèm theo danh sách contributions
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> getCampaignDetail(@PathVariable UUID id) {
        // Service này trả về Map hoặc DTO chứa thông tin Summary + List<ContributionSummary>
        Object detail = campaignService.getCampaignDetail(id);
        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Campaign details retrieved successfully",
                detail
        );
    }

    /**
     * Thêm người đóng góp thủ công vào chiến dịch
     * Tự động cập nhật tổng tiền và số người tham gia trong chiến dịch
     */
    @PostMapping("/contributions")
    public ResponseEntity<Object> addContributor(@Valid @RequestBody AddContributionRequestDTO request) {
        ContributionRecord record = campaignService.addContribution(request);
        return ApiResponse.responseBuilder(
                HttpStatus.CREATED,
                "Contributor added successfully",
                record
        );
    }
    
 // Thêm vào VoluntaryContributionController.java

    /**
     * Sửa đổi thông tin chiến dịch
     */
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCampaign(
            @PathVariable UUID id, 
            @Valid @RequestBody CreateCampaignRequestDTO request) {
        
        VoluntaryContribution updated = campaignService.updateCampaign(id, request);
        return ApiResponse.responseBuilder(
                HttpStatus.OK, 
                "Campaign updated successfully", 
                updated
        );
    }

    /**
     * Xóa chiến dịch
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCampaign(@PathVariable UUID id) {
        campaignService.deleteCampaign(id);
        return ApiResponse.responseBuilder(
                HttpStatus.OK, 
                "Campaign deleted successfully", 
                null
        );
    }
    
    
    @SuppressWarnings("null")
    @GetMapping("/{campaignId}/export/excel")
    public ResponseEntity<InputStreamResource> exportContributionsToExcel(@PathVariable UUID campaignId) {
        InputStreamResource file = new InputStreamResource(excelExportService.exportContributionsToExcel(campaignId));
        
        String fileName = "DanhSachDongGop_" + campaignId + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}