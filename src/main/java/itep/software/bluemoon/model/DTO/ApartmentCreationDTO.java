package itep.software.bluemoon.model.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApartmentCreationDTO {
    private int roomNumber;
    private int floor;
    private Double area;
    private UUID buildingId;
    private UUID ownerId;
}
