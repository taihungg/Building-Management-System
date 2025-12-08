package itep.software.bluemoon.service;

import itep.software.bluemoon.model.DTO.issue.IssueCreateRequestDTO;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.IssueRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;

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
                .reporter(reporter)
                .build();

        return issueRepository.save(issue);
    }
    
    public IssueResponseDTO updateStatus(UUID issueId, IssueStatus newStatus) {

        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueStatus currentStatus = issue.getStatus();

        // ❗ kiểm tra luồng trạng thái
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
            .reporterId(saved.getReporter().getId())
            .build();
    }
    
    private boolean isValidTransition(IssueStatus from, IssueStatus to) {
        return switch (from) {
            case UNPROCESSED -> to == IssueStatus.PROCESSING;
            case PROCESSING  -> to == IssueStatus.PROCESSED;
            case PROCESSED   -> false;
        };
    }



}
