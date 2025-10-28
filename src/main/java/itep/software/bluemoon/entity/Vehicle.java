package itep.software.bluemoon.entity;

import itep.software.bluemoon.entity.person.Person;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    private String id;
    private String name;
    private String description;
    private Person owner;
}
