package itep.software.bluemoon.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import itep.software.bluemoon.entity.person.Person;
import itep.software.bluemoon.enumeration.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "role", length = 20)
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "person_id",
            referencedColumnName = "id",
            unique = true
    )
    private Person person;
}
