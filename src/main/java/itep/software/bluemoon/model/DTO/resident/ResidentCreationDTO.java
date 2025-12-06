package itep.software.bluemoon.model.DTO.resident;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResidentCreationDTO {
    private String fullName;
    private String idCard;
    private LocalDate dob;
    private String homeTown;
    private UUID apartmentID;
}
