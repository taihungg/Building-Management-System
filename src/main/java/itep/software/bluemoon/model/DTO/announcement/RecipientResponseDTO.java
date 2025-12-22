package itep.software.bluemoon.model.DTO.announcement;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecipientResponseDTO {
    private UUID residentId;
    private String fullName;
    private String apartmentInfo; // VD: "P.501"
    private boolean isRead;
}