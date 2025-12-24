package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.util.UUID;

import itep.software.bluemoon.enumeration.TierCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "price_tier")
public class PriceTier {
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
    @Column(name = "code", length = 10)
    private TierCode code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_price_id", nullable = false)
    private ServicePrice servicePrice;

    @Column(name = "min_usage")
    private int minUsage;

    @Column(name = "max_usage")
    private Integer maxUsage;

    @Column(name = "unit_price", nullable = false, precision = 20, scale = 2)
    private BigDecimal unitPrice;
}
