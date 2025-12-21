package itep.software.bluemoon.model.DTO.resident;

import java.time.LocalDate;
import java.util.UUID;

import itep.software.bluemoon.enumeration.ResidentStatus;
import lombok.Data;

@Data
public class ResidentUpdateDTO {
    private String fullName;
    private String idCard;
    private String email;
    private String phone;
    private LocalDate dob;
    private String homeTown;
    private ResidentStatus status;
    private UUID apartmentId;
}
