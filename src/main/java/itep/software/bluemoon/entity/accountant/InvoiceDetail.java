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
@Table(name = "invoice_detail")
public class InvoiceDetail {
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
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "old_index")
    private Double oldIndex;

    @Column(name = "new_index")
    private Double newIndex;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
