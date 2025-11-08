package itep.software.bluemoon.model.DTO;

import itep.software.bluemoon.enumeration.ResidentRelationship;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

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
    private ResidentRelationship relationship;
    private int roomNumber;
    private String email;
    private String phoneNumber;
}
