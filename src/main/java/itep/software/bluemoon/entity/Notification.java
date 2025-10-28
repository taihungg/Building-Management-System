package itep.software.bluemoon.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.NotificationType;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder 
@Entity
@Table(name = "notification", indexes = {
    @Index(name = "idx_recipient_created", columnList = "recipient_id, created_at DESC"),
    @Index(name = "idx_recipient_read", columnList = "recipient_id, is_read"),
    @Index(name = "idx_type_created", columnList = "type, created_at DESC")
})
public class Notification {
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

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Resident recipient;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Reference ID cho các entity liên quan (Bill, Issue, etc.)
    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "reference_type")
    private String referenceType; // "BILL", "ISSUE", etc.
}