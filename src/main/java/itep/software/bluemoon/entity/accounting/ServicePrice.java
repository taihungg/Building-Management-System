package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
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
@Table(name = "service_price")
public class ServicePrice {
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
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "end_date")
    private LocalDate endDate;

    //chỉ có tiền điện nước thì cái này mới là false, và dùng tới price tier
    @Column(name = "is_flat", nullable = false)
    private boolean isFlat;

    @Column(name = "flat_price", precision = 20, scale = 2)
    private BigDecimal flatPrice;

    @OneToMany(mappedBy = "servicePrice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("minUsage ASC")
    private List<PriceTier> tiers;

    @Column(name = "vat_rate", precision = 6, scale = 2)
    private BigDecimal vatRate;

    //phí bảo vệ môi trường dành riêng cho tiền nước
    @Column(name = "env_rate", precision = 6, scale = 2)
    private BigDecimal envRate;
}
