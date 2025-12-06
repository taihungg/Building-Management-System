package itep.software.bluemoon.entity;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import itep.software.bluemoon.entity.accountant.Invoice;
import itep.software.bluemoon.entity.person.Resident;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "apartment")
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Column(name = "room_number")
    private int roomNumber;

    @Column(name = "floor")
    private int floor;

    @Column(name = "area")
    private Double area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private Resident owner;

    @OneToMany(mappedBy = "apartment")
    @JsonManagedReference
    @Builder.Default
    private List<Resident> residents = new ArrayList<>();

    @OneToMany(
        mappedBy = "apartment",
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Invoice> invoices = new ArrayList<>();

    @OneToMany(
        mappedBy = "apartment",
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Issue> issues = new ArrayList<>();
}
