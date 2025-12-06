package itep.software.bluemoon.entity.accountant;

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

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "start_date")
    private LocalDate startDate; // Ngày bắt đầu hiệu lực (VD: 01/01/2024)

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "end_date")
    private LocalDate endDate;   // Ngày kết thúc (NULL = Đang áp dụng)

    @Enumerated(EnumType.STRING)
    @Column(name = "price_model")
    private PriceModel priceModel;

    @OneToMany(mappedBy = "servicePrice", cascade = CascadeType.ALL)
    @OrderBy("minUsage ASC")
    private List<PriceTier> tiers;
}
