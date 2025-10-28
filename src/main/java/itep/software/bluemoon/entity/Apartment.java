package itep.software.bluemoon.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import itep.software.bluemoon.entity.person.Resident;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "apartments")
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

    private int roomNumber;
    private int floor;
    private double area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @ManyToOne
    @JoinColumn(name = "resident_id")
    private Resident owner;

    @OneToMany(
            mappedBy = "apartment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private ArrayList<Resident> residents;

    private ArrayList<Bill> bills;

    private ArrayList<Issue> issue;
}
