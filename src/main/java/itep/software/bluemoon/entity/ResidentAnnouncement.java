package itep.software.bluemoon.entity;

import itep.software.bluemoon.entity.key.ResidentAnnouncementId;
import itep.software.bluemoon.entity.person.Resident;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
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
    @EmbeddedId
    private ResidentAnnouncementId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("residentId")
    @JoinColumn(name = "resident_id") 
    private Resident resident;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("announcementId")
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
}