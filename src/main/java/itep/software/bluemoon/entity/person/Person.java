package itep.software.bluemoon.entity.person;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public abstract class Person {
    private String id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String idCard;
    private LocalDate dob;
    private String homeTown;
}
