package itep.software.bluemoon.model.DTO.resident;

import java.time.LocalDate;
import java.util.UUID;

import itep.software.bluemoon.enumeration.ResidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResidentDetailDTO {
    private UUID id;
    private String fullName;
    private String idCard;
    private LocalDate dob;
    private String homeTown;
    private Integer roomNumber;
    private String email;
    private String phone;
    private ResidentStatus status;
}
