package itep.software.bluemoon.service;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.enumeration.IssueType;
import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.projection.IssueSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.IssueRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueService {
    private final IssueRepository issueRepository;
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    
    public Issue createIssue(IssueCreateRequestDTO request) { // ← BỎ @SuppressWarnings
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        Resident reporter = residentRepository.findById(request.getReporterId())
                .orElseThrow(() -> new RuntimeException("Resident not found"));
        Issue issue = Issue.builder()
                .apartment(apartment)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .status(IssueStatus.UNPROCESSED)
                .reporter(reporter)
                .location(request.getLocation())
                .build();
        return issueRepository.save(issue);
    }
    
    public IssueSummary updateStatus(UUID issueId, IssueStatus newStatus) { // ← BỎ @SuppressWarnings
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        IssueStatus currentStatus = issue.getStatus();
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException(
                "Invalid status transition: " + currentStatus + " → " + newStatus
            );
        }
        
        issue.setStatus(newStatus);
        issueRepository.save(issue);
        
        return issueRepository.findIssueSummaryById(issue.getId())
            .orElseThrow(() -> new RuntimeException("Failed to retrieve updated issue"));
    }
    
    private boolean isValidTransition(IssueStatus from, IssueStatus to) {
        return switch (from) {
        case UNPROCESSED -> to == IssueStatus.PROCESSING || to == IssueStatus.PROCESSED;
        case PROCESSING  -> to == IssueStatus.PROCESSED;
        case PROCESSED   -> false;
        };
    }
    
    @Transactional(readOnly = true)
    public List<IssueSummary> getAllIssues() {
        return issueRepository.findAllIssueSummaries();
    }
    
    @Transactional(readOnly = true)
    public int countIssuesByType(IssueType type) {
        return issueRepository.countByType(type);
    }
    
    @Transactional(readOnly = true)
    public List<IssueSummary> getIssuesByType(IssueType type) {
        return issueRepository.findIssueSummariesByType(type);
    }
}