package itep.software.bluemoon.model.mapper;

import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.model.DTO.issue.IssueResponseDTO;

public class EntityToDto {
    public static IssueResponseDTO issueToIssueResponseDto(Issue issue) {
        if (issue == null) {
            return null;
        }
        
        return IssueResponseDTO.builder()
                .id(issue.getId())
                .apartmentId(issue.getApartment().getId())
                .roomNumber(issue.getApartment().getRoomNumber())
                .reporterId(issue.getReporter().getId())
                .reporterName(issue.getReporter().getFullName())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .type(issue.getType())
                .status(issue.getStatus())
                .build();
    }
}
