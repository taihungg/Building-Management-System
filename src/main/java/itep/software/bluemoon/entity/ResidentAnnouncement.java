package itep.software.bluemoon.entity;

import java.util.UUID;

import itep.software.bluemoon.entity.person.Resident;
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
@Table(name = "resident_announcement")
public class ResidentAnnouncement {
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
	@JoinColumn(name = "resident_id", nullable = false)
	private Resident resident;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "announcement_id", nullable = false)
	private Announcement announcement;
	
	@Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;
}
