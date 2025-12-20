package itep.software.bluemoon.entity.person;

import java.util.ArrayList;
import java.util.List;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.enumeration.ResidentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "resident")
public class Resident extends Person {
    @Column(name = "status", length = 8)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ResidentStatus status = ResidentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "resident_announcement",
        joinColumns = @JoinColumn(name = "resident_id"),
        inverseJoinColumns = @JoinColumn(name = "announcement_id")
    )
    @Builder.Default
    private List<Announcement> receivedAnnouncements = new ArrayList<>();
}
