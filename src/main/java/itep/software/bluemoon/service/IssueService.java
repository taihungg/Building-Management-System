package itep.software.bluemoon.service;

import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;
import itep.software.bluemoon.model.projection.IssueSummary;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.IssueStatus;
//import itep.software.bluemoon.enumeration.IssueLevel;
//import itep.software.bluemoon.enumeration.EscalationRequest;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.IssueRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    
    //tạo Issue
    public Issue createIssue(IssueCreateRequestDTO request) {

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
                //.level(request.getLevel())
                //.escRequest(escalationRequest(request.getLevel()))
                .reporter(reporter)
                .build();

        return issueRepository.save(issue);
    }
    /*
    public EscalationRequest escalationRequest(IssueLevel level) {
        return level == IssueLevel.AUTHORITY
                ? EscalationRequest.REQUESTED
                : EscalationRequest.NONE;
    }
    */

    
    public IssueResponseDTO updateStatus(UUID issueId, IssueStatus newStatus) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        IssueStatus currentStatus = issue.getStatus();
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException(
                "Invalid status transition: " + currentStatus + " → " + newStatus
            );
        }
        
        issue.setStatus(newStatus);
        Issue saved = issueRepository.save(issue);
        
        return IssueResponseDTO.builder()
            .id(saved.getId())
            .title(saved.getTitle())
            .description(saved.getDescription())
            .type(saved.getType())
            .status(saved.getStatus())
            .apartmentId(saved.getApartment().getId())
            .roomNumber(saved.getApartment().getRoomNumber())
            .reporterId(saved.getReporter().getId())
            .reporterName(saved.getReporter().getFullName())
            .build();
    }
    
    private boolean isValidTransition(IssueStatus from, IssueStatus to) {
        return switch (from) {
            case UNPROCESSED -> to == IssueStatus.PROCESSING;
            case PROCESSING  -> to == IssueStatus.PROCESSED;
            case PROCESSED   -> false;
        };
    }

    @Transactional(readOnly = true)
    public List<IssueSummary> getAllIssues() {
    	return issueRepository.findAllIssueSummaries();
    }

}
