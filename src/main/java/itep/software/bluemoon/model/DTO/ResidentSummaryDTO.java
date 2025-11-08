package itep.software.bluemoon.model.DTO;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResidentSummaryDTO {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private int roomNumber;
}
