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
public class ResidentCreationDTO {
    private String fullName;
    private String idCard;
    private String email;
    private String phone;
    private LocalDate dob;
    private String homeTown;
    private ResidentStatus status;
    private UUID apartmentID;
}
