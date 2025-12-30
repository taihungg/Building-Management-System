package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 20, scale = 2)
    private BigDecimal unitPrice; // giá bậc 0 hoặc trung bình

    @Column(name = "amount_initial", precision = 20, scale = 2)
    private BigDecimal amountInitial;

    @Column(name = "vat", precision = 20, scale = 2)
    private BigDecimal vat;

    @Column(name = "env", precision = 20, scale = 2)
    private BigDecimal env;

    @Column(name = "amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;

    //nếu tính giá điện, nước thì cần thuộc tính này, không thì null
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_record_id")
    private UsageRecord usageRecord;

    //nếu tính tiền các dịch vụ khác thì cần dòng này, không thì null
    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "line_items", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String lineItems;
}
