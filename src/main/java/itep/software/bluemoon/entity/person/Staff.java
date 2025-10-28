package itep.software.bluemoon.entity.person;

import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.User;
import itep.software.bluemoon.enumeration.StaffRole;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "staff")
public class Staff extends Person {
    @Column(name = "employee_code", unique = true, nullable = false)
    private String employeeCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private StaffRole role;

    @Column(name = "hire_date")
    private LocalDate hireDate; // Ngày vào làm

    @Column(name = "salary")
    private BigDecimal salary;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private User account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building assignedBuilding;

}
