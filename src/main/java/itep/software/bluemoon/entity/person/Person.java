package itep.software.bluemoon.entity.person;

import itep.software.bluemoon.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
public abstract class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String firstName;

    private String middleName;

    private String lastName;

    @Column(unique = true)
    private String idCard;

    private LocalDate dob;

    private String homeTown;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL) // 1.
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true) // 2.
    private User account;
}
