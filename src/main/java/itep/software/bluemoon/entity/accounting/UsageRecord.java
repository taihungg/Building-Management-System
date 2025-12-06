package itep.software.bluemoon.entity.accounting;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.enumeration.UsageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "usage_record", uniqueConstraints = {@UniqueConstraint(columnNames = {"apartment_id", "service_type_id", "month", "year"})})
public class UsageRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @Column(name = "month", nullable = false)
    private int month;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "old_index", nullable = false)
    private Double oldIndex;

    @Column(name = "new_index", nullable = false)
    private Double newIndex;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "reading_date")
    private LocalDateTime readingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_status")
    private UsageStatus status;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
}
