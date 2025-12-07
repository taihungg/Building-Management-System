package itep.software.bluemoon.model.DTO.apartment;

import lombok.*;

import java.util.UUID;

@Getter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApartmentCreationDTO {
    private Integer roomNumber;
    private Integer floor;
    private Double area;
    private UUID buildingId;
    private UUID ownerId;
}
