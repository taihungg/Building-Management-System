package itep.software.bluemoon.entity;

import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.enumeration.IssueType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "issue")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private IssueStatus status;
}
