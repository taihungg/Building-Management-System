package itep.software.bluemoon.model.DTO.resident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResidentAccountCreationDTO {
    private String email;
    private String phone;
}