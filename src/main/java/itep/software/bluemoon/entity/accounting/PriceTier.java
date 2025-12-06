package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
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
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_price_id", nullable = false)
    private ServicePrice servicePrice;

    @Column(name = "min_usage")
    private int minUsage;

    @Column(name = "max_usage")
    private int maxUsage;

    @Column(name = "unite_price", nullable = false)
    private BigDecimal unitPrice;
}
