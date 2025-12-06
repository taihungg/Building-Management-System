package itep.software.bluemoon.entity.accountant;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.enumeration.BillStatus;
import itep.software.bluemoon.enumeration.BillType;
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
@Table(name = "invoice")
public class Invoice {
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
    @Column(name = "type", nullable = false)
    private BillType type;

    @Column(name = "month")
    private int month;

    @Column(name = "year")
    private int year;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BillStatus status;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    @Builder.Default
    private List<InvoiceDetail> details = new ArrayList<>();
}
