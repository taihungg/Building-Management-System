package itep.software.bluemoon.entity;


import itep.software.bluemoon.entity.person.Resident;
import lombok.*;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {
    private String id;
    private int roomNumber;
    private int floor;
    private double area;

    private Resident owner;

    private ArrayList<Resident> residents;

    private ArrayList<Bill> bills;

    private ArrayList<Issue> issue;
}
