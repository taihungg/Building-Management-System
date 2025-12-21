package itep.software.bluemoon.model.DTO.apartment;

import java.math.BigDecimal;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApartmentCreationDTO {
    private Integer roomNumber;
    private Integer floor;
    private BigDecimal area;
    private UUID buildingId;
    private UUID ownerId;
}
