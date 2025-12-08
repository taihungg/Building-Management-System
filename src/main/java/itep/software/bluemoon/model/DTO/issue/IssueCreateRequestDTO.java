package itep.software.bluemoon.model.DTO.issue;
import itep.software.bluemoon.enumeration.IssueType;
import lombok.Data;
import java.util.UUID;

@Data
public class IssueCreateRequestDTO {
    private UUID apartmentId;
    private String title;
    private String description;
    private IssueType type;
    private UUID reporterId;
}