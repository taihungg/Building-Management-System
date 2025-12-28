package itep.software.bluemoon.entity.accounting;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import itep.software.bluemoon.entity.BaseEntity;
import itep.software.bluemoon.enumeration.CampaignStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "voluntary_contribution")
public class VoluntaryContribution extends BaseEntity { 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "goal_amount", precision = 20, scale = 2)
    private BigDecimal goalAmount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "campaign_end_date", nullable = false)     // Kết thúc hoàn toàn
    private LocalDate campaignEndDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "contribution_deadline", nullable = false) //Kết thúc đóng góp
    private LocalDate contributionDeadline;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.DRAFT;
    
    @Column(name = "is_public", nullable = false)  //Public danh sách đóng góp không
    @Builder.Default
    private boolean isPublic = true;
    
    @Column(name = "total_collected", precision = 20, scale = 2)  
    @Builder.Default
    private BigDecimal totalCollected = BigDecimal.ZERO;
    
    @Column(name = "total_contributors")
    @Builder.Default
    private Integer totalContributors = 0;
    
    @OneToMany(
    		mappedBy = "campaign", 
    		cascade = CascadeType.ALL, 
    		orphanRemoval = true, 
    		fetch = FetchType.LAZY)
    @Builder.Default
    private List<ContributionRecord> contributions = new ArrayList<>();
}