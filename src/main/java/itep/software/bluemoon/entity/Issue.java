package itep.software.bluemoon.entity;

import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.enumeration.IssueType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {
    private String id;

    private String title;

    private String description;

    private IssueType type;

    private IssueStatus status;
}
