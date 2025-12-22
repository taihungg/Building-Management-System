package itep.software.bluemoon.entity.person;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import itep.software.bluemoon.entity.Announcement;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "staff")
@PrimaryKeyJoinColumn(name = "id")
public class Staff extends Person {
    @Column(name = "hire_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate hireDate;

    @Column(name = "salary", precision = 19, scale = 2)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "#,##0.00")
    private BigDecimal salary;
    
    @OneToMany(
        	mappedBy = "sender",
        	cascade = CascadeType.ALL,
        	orphanRemoval = true,
            fetch = FetchType.LAZY
        )
    @Builder.Default
    private List<Announcement> announcementsCreated = new ArrayList<>();
}