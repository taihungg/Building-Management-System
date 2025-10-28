package itep.software.bluemoon.entity.person;

import com.fasterxml.jackson.annotation.JsonBackReference;
import itep.software.bluemoon.entity.*;
import itep.software.bluemoon.enumeration.ResidentRelationship;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "residents")
public class Resident extends Person {
    private ResidentRelationship relationship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    @JsonBackReference
    private Apartment apartment;

    private ArrayList<Issue> reportedIssues;

    private ArrayList<Vehicle> vehicles;

    private ArrayList<Announcement> receivedAnnouncements;
}
