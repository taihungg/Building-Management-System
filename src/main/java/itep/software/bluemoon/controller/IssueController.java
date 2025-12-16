package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;
import itep.software.bluemoon.model.projection.IssueSummary;
import itep.software.bluemoon.model.DTO.issue.IssueUpdateStatusRequestDTO;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity; 
import java.util.UUID;
import java.util.List;

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
}
