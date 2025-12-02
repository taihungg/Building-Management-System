package itep.software.bluemoon.entity.person;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Issue;
import itep.software.bluemoon.entity.Vehicle;
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
import jakarta.persistence.OneToMany;
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
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ResidentStatus status = ResidentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = true)
    @JsonBackReference
    private Apartment apartment;

    @OneToMany(
        mappedBy = "reporter",
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Issue> reportedIssues = new ArrayList<>();

    @OneToMany(
        mappedBy = "owner",
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "resident_announcement",
        joinColumns = @JoinColumn(name = "resident_id"),
        inverseJoinColumns = @JoinColumn(name = "announcement_id")
    )
    @Builder.Default
    private List<Announcement> receivedAnnouncements = new ArrayList<>();
}
