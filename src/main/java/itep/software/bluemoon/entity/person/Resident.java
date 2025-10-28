package itep.software.bluemoon.entity.person;

import itep.software.bluemoon.entity.*;
import itep.software.bluemoon.enumeration.ResidentRelationship;
import lombok.*;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resident extends Person {
    private User account;

    private ResidentRelationship relationship;

    private Apartment apartment;

    private ArrayList<Issue> reportedIssues;

    private ArrayList<Vehicle> vehicles;

    private ArrayList<Notification> receivedNotifications;
}
