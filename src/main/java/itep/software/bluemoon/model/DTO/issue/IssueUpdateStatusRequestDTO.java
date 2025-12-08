package itep.software.bluemoon.model.DTO.issue;

import itep.software.bluemoon.enumeration.IssueStatus;
import lombok.Data;

@Data
public class IssueUpdateStatusRequestDTO {
    private IssueStatus status;
}
