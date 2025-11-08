package itep.software.bluemoon.model.mapper;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ResidentSummaryDTO;

public class EntityToDto {
    public static ResidentSummaryDTO residentSummaryDTOToDto(Resident resident){
        if (resident == null) {
            return null;
        }
        return ResidentSummaryDTO.builder()
                .id(resident.getId())
                .fullName(resident.getFullName())
                .email(resident.getAccount() != null ? resident.getAccount().getEmail() : null)
                .phoneNumber(resident.getAccount() != null ? resident.getAccount().getPhone() : null)
                .roomNumber(resident.getApartment() != null ? resident.getApartment().getRoomNumber() : null)
                .build();
    }
}
