package itep.software.bluemoon.entity.accountant;

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

    @Column(name = "name")
    private String name;

    @Column(name = "unit")
    private String unit;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "service_price_id", referencedColumnName = "id")
    private ServicePrice servicePrice;
}
