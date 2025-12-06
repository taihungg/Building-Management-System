package itep.software.bluemoon.entity.accountant;

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

    @ManyToOne
    @JoinColumn(name = "service_price_id")
    private ServicePrice servicePrice;

    @Column(name = "min_usage")
    private int minUsage; // Bậc từ (VD: 0)

    @Column(name = "max_usage")
    private int maxUsage; // Bậc đến (VD: 50). NULL nghĩa là vô cùng (cho bậc cuối)

    @Column(name = "unite_price", nullable = false)
    private BigDecimal unitPrice;
}
