package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;
import itep.software.bluemoon.model.DTO.issue.IssueUpdateStatusRequestDTO;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

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
                issue.getReporter().getId(),
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
}
