package itep.software.bluemoon.model.DTO.resident;

import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;

@Data
public class ResidentUpdateDTO {
    private String fullName;
    private String idCard;
    private LocalDate dob;
    private String homeTown;
    private String email;
    private String phone;
}
