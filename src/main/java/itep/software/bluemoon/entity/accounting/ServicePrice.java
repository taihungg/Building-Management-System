package itep.software.bluemoon.entity.accounting;

import itep.software.bluemoon.enumeration.PriceModel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    private LocalDate endDate;   // Ngày kết thúc (NULL = Đang áp dụng)

    @Enumerated(EnumType.STRING)
    @Column(name = "model")
    private PriceModel model;

    @OneToMany(mappedBy = "servicePrice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("minUsage ASC")
    private List<PriceTier> tiers;
}
