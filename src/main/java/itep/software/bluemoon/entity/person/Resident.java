package itep.software.bluemoon.entity.person;

import java.util.ArrayList;
import java.util.List;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.enumeration.ResidentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "resident")
@PrimaryKeyJoinColumn(name = "id")
public class Resident extends Person {
    @Column(name = "status", length = 8)
    @Enumerated(EnumType.STRING)
    private ResidentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @OneToMany(
    	mappedBy = "resident",
    	cascade = CascadeType.ALL,
    	orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ResidentAnnouncement> announcementsReceived = new ArrayList<>();
}