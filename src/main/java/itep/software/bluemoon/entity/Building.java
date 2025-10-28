package itep.software.bluemoon.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "building")
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            updatable = false,
            nullable = false,
            columnDefinition = "UUID"
    )
    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @OneToMany(
            mappedBy = "building", // <-- 4. "building" là tên thuộc tính bên class Apartment
            cascade = CascadeType.ALL, // Tùy chọn: Xóa/cập nhật apartment khi building bị xóa
            orphanRemoval = true
    )
    @Builder.Default // <-- 5. Khởi tạo list
    private List<Apartment> apartments = new ArrayList<>();
}
