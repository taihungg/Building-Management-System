package itep.software.bluemoon.model.mapper;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ResidentDetailDTO;

public class EntityToDto {
    public static ResidentDetailDTO residentToResidentDetailDto(Resident resident){
        if (resident == null) {
            return null;
        }
        return ResidentDetailDTO.builder()
                .id(resident.getId())
                .fullName(resident.getFullName())
                .idCard(resident.getIdCard())
                .dob(resident.getDob())
                .homeTown(resident.getHomeTown())
                .relationship(resident.getRelationship())
                .roomNumber(resident.getApartment() != null ? resident.getApartment().getRoomNumber() : null)
                .email(resident.getAccount() != null ? resident.getAccount().getEmail() : null)
                .phoneNumber(resident.getAccount() != null ? resident.getAccount().getPhone() : null)
                .build();
    }

}
