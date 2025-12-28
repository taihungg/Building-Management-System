package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import itep.software.bluemoon.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "contribution_record")
public class ContributionRecord extends BaseEntity {
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
    @JoinColumn(name = "campaign_id", nullable = false)
    private VoluntaryContribution campaign;
    
    @Column(name = "contributor_name", nullable = false, length = 100)
    private String contributorName;
    
    @Column(name = "phone", length = 15)
    private String phone;
    
    @Column(name = "address", length = 200)
    private String address;
    
    @Column(name = "amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "contribution_date", nullable = false)
    private LocalDate contributionDate;
}