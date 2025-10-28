package itep.software.bluemoon.entity;

import itep.software.bluemoon.enumeration.BillStatus;
import itep.software.bluemoon.enumeration.BillType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "bill")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private BillType type;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expired_date")
    private LocalDate expiredDate;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BillStatus status;
}
