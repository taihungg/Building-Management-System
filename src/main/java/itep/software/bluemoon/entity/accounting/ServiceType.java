package itep.software.bluemoon.entity.accounting;

import itep.software.bluemoon.enumeration.ServiceCode;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "service_type")
public class ServiceType {
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
    @Column(name = "service_code")
    private ServiceCode serviceCode;

    @Column(name = "unit")
    private String unit;
}
