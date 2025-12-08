package itep.software.bluemoon.model.DTO.issue;
import itep.software.bluemoon.enumeration.IssueType;
import itep.software.bluemoon.enumeration.IssueStatus;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;



@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssueResponseDTO {
    private UUID id;
    private UUID apartmentId;
    private UUID reporterId;
    private String title;
    private String description;
    private IssueType type;
    private IssueStatus status;
}
