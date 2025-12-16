package itep.software.bluemoon.model.DTO.apartment;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class ApartmentResidentUpdateDTO {
    private List<UUID> residentIds;
}