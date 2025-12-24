package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.util.UUID;

import itep.software.bluemoon.entity.Apartment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(name = "usage_record", 
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_usage_apt_service_time",
               columnNames = {"apartment_id", "service_type_id", "month", "year"} 
           )
       })
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

    @Column(name = "old_index", nullable = false, precision = 10, scale = 0)
    private BigDecimal oldIndex;

    @Column(name = "new_index", nullable = false, precision = 10, scale = 0)
    private BigDecimal newIndex;

    @Column(name = "quantity", nullable = false, precision = 10, scale = 0)
    private BigDecimal quantity;
}
