package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.enumeration.IssueType;
import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;
import itep.software.bluemoon.model.DTO.issue.IssueUpdateStatusRequestDTO;
import itep.software.bluemoon.model.projection.IssueSummary;
import itep.software.bluemoon.service.IssueService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public IssueResponseDTO createIssue(
            @RequestBody IssueCreateRequestDTO request) {

        Issue issue = issueService.createIssue(request);

        return new IssueResponseDTO(
                issue.getId(),
                issue.getApartment().getId(),
                issue.getApartment().getRoomNumber(),
                issue.getReporter().getId(),
                issue.getReporter().getFullName(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getType(),
                issue.getStatus()
        );
    }
    
    @PatchMapping("/{id}/status")
    public IssueResponseDTO updateIssueStatus(
            @PathVariable UUID id,
            @RequestBody IssueUpdateStatusRequestDTO request
    ) {
        return issueService.updateStatus(id, request.getStatus());
    }
    
    @GetMapping
    public ResponseEntity<List<IssueSummary>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }
    
    
    @GetMapping("/count/security")
    public ResponseEntity<Integer> countSecurityIssues() {
        // Lấy ra số lượng Issue có IssueType.SECURITY
        return ResponseEntity.ok(issueService.countIssuesByType(IssueType.SECURITY));
    }
    
    @GetMapping("/security")
    public ResponseEntity<List<IssueSummary>> getSecurityIssues() {
    	// Lấy ra danh sách Issue có IssueType.SECURITY
        return ResponseEntity.ok(issueService.getIssuesByType(IssueType.SECURITY));
    }
}
