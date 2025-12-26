package itep.software.bluemoon.model.DTO.announcement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipientStatusResponseDTO {
    private String residentName;  
    private Integer roomNumber;     
    private String buildingName;   
    private Boolean isRead;        
}