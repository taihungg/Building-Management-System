package itep.software.bluemoon.model.DTO.apartment;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.projection.ResidentSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApartmentDetailDTO {
    private UUID id;
    private ApartmentInfoDTO info;
    private OwnerInfoDTO owner;
    private List<ResidentSummary> residents;
    private SummaryDTO summary;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ApartmentInfoDTO {
        private Integer roomNumber;
        private Integer floor;
        private BigDecimal area;
        private String buildingName;
        private Integer numberOfResidents;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OwnerInfoDTO {
        private UUID id;
        private String fullName;
        private String phone;
        private String email;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SummaryDTO {
        private Integer unpaidInvoicesCount;
        private Integer vehicleCount;
        private Integer pendingIssuesCount;
    }
}
