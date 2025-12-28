package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.enumeration.IssueType;
import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueUpdateStatusRequestDTO;
import itep.software.bluemoon.model.projection.IssueSummary;
import itep.software.bluemoon.repository.IssueRepository;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.IssueService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final IssueRepository issueRepository;

    @PostMapping
    public ResponseEntity<Object> createIssue(@RequestBody IssueCreateRequestDTO request) {
        Issue issue = issueService.createIssue(request);

        IssueSummary summary = issueRepository.findIssueSummaryById(issue.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve created issue"));

        return ApiResponse.responseBuilder(
                HttpStatus.CREATED,
                "Issue created successfully",
                summary
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> updateIssueStatus(
            @PathVariable UUID id,
            @RequestBody IssueUpdateStatusRequestDTO request
    ) {
        IssueSummary summary = issueService.updateStatus(id, request.getStatus());

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Issue status updated successfully",
                summary
        );
    }

    @GetMapping
    public ResponseEntity<Object> getAllIssues(
            @RequestParam(required = false) IssueType type
    ) {
        List<IssueSummary> issues;

        if (type != null) {
            issues = issueService.getIssuesByType(type);
        } else {
            issues = issueService.getAllIssues();
        }

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Issues retrieved successfully",
                issues
        );
    }

    @GetMapping("/count/security")
    public ResponseEntity<Object> countSecurityIssues() {
        int count = issueService.countIssuesByType(IssueType.SECURITY);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Security issues count retrieved successfully",
                count
        );
    }

    @GetMapping("/security")
    public ResponseEntity<Object> getSecurityIssues() {
        List<IssueSummary> issues = issueService.getIssuesByType(IssueType.SECURITY);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Security issues retrieved successfully",
                issues
        );
    }
}