package itep.software.bluemoon.model.mapper;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.apartment.ApartmentDetailDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentDetailDTO;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ResidentRepository;

import java.util.List;

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
                .roomNumber(resident.getApartment() != null ? resident.getApartment().getRoomNumber() : null)
                .email(resident.getAccount() != null ? resident.getAccount().getEmail() : null)
                .phoneNumber(resident.getAccount() != null ? resident.getAccount().getPhone() : null)
                .status(resident.getStatus())
                .build();
    }

    public static ApartmentDetailDTO apartmentToApartmentDetailDto(Apartment apartment, ResidentRepository residentRepository){
        ApartmentDetailDTO.ApartmentInfoDTO info = ApartmentDetailDTO.ApartmentInfoDTO.builder()
                .roomNumber(apartment.getRoomNumber())
                .floor(apartment.getFloor())
                .area(apartment.getArea())
                .buildingName(apartment.getBuilding().getName())
                .numberOfResidents(apartment.getResidents().size())
                .build();

        ApartmentDetailDTO.OwnerInfoDTO owner = ApartmentDetailDTO.OwnerInfoDTO.builder()
                .id(apartment.getOwner().getId())
                .fullName(apartment.getOwner().getFullName())
                .phoneNumber(apartment.getOwner().getAccount().getPhone())
                .email(apartment.getOwner().getAccount().getEmail())
                .build();

        List<ResidentSummary> residents = residentRepository.findByApartment_Id(apartment.getId());

        ApartmentDetailDTO.SummaryDTO summary = ApartmentDetailDTO.SummaryDTO.builder()
                .build();

        return ApartmentDetailDTO.builder()
                .id(apartment.getId())
                .info(info)
                .owner(owner)
                .residents(residents)
                .summary(summary)
                .build();
    }
}
